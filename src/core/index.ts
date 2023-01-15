import Api, { ApiModules } from "../api/index.js";
import DCClient from "../client/index.js";
import DBStorage from "./dbstorage.js";
import Socket from "./socket.js";
import pg from "pg";
import fs from "fs";

export default class Client extends Socket {
  private static _listeners: [Object, Reciver, ...string[]][] = [];

  /**
    (Decorator) Register a listener using @Client.listen("event1", "event2", ...)
  */
  public static listen(...events: string[]) {
    return (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => {
      Client._listeners.push([target, descriptor.value, ...events.map(v => v.toUpperCase())]);
      return descriptor;
    }
  }
  
  // PostgreSQL client
  private readonly postgres?: pg.Client;
  // PostresSQL connection promise
  private readonly postgresPromise?: Promise<void>;
  // List of used modules
  private readonly loadedModules: Module[] = [];
  // List of formatted environment variables
  private readonly _env: { [key: string]: EnvType } = {};
  // List of callbacks to call when the client receives a specific event { event: [id, callback][] }
  private readonly dispatchListeners: Listeners = {};
  // Callback to call when the client receives a dispatch
  private eventDispatcher: (payload: any, event: string) => Promise<void> | void = this.dispatcher;
  // If client recieved a ready event
  private _clientReady: boolean = false;
  private _userReady: ((value: void | PromiseLike<void>) => void) | null = null;
  // Tasks to run before the client calls ready event
  private readonly _readyTasks: Promise<void>[] = [];
  // Discord API wrapper
  private readonly _api: Api;
  // Database storage
  private readonly _storage?: DBStorage;
  // Discord client storage
  public readonly client: DCClient = new DCClient(this);

  /**
    Initializes a new connection with discord using the provided authorization token.
    @param opt.authorization The authorization token to use.
    @param opt.logs If logs should be printed to the console.
    @param opt.postgres The postgres connection string to use.
  */
  constructor(opt: ClientOptions) {
    super(opt.authorization, opt.logs ?? false);
    this._api = new Api(opt.authorization);

    if (opt.autoReady) this.ready();

    // Register listeners
    this.once("ready", this.clientReady.bind(this));
    this.on("dispatch", async (d, t) => this.eventDispatcher(d, t));
    this.on("dispatch", async (d, t) => this.client.dispatch(d, t));

    // Initialize postgres client
    if (!opt.postgres) return;
    this.postgres = new pg.Client({ connectionString: opt.postgres, ssl: { rejectUnauthorized: false } });
    this._readyTasks.push(this.postgres.connect().then(() => this.log("Core", "Connected to PostgreSQL database.")));

    // Initialize database storage
    this._storage = new DBStorage(this);
  }

  /**
   * Call `ready` method on all modules when the client is entirely ready.
  */
  public ready(): Promise<void> {
    if (this._userReady !== null) throw new Error("[Cumsocket] Cannot emit ready event twice.");
    return new Promise(resolve => {
      this._userReady = resolve;
      this.tryReady();
    });
  }

  // Do every on-ready tasks and try to execute ready method on all modules
  private clientReady(): void {
    // Tasks to do
    Promise.all([
      ...this._readyTasks,
      this._storage?.sync(),
    ]).then(() => {
      this._clientReady = true;
      this.tryReady();
    });
  }

  // Try to execute ready method on all modules
  private async tryReady(): Promise<void> {
    // Check if both the client and user are ready
    if (!this._userReady || !this._clientReady) return;
    
    // Execute ready method on all modules
    await Promise.all(this.loadedModules.map(v => v.ready?.(this)));
    this.log("Core", "Executed ready method on all modules.");
    
    // Resolve ready promise
    this._userReady();
  }

  private async dispatcher(payload: any, event: string): Promise<void> {
    this.dispatchListeners[event]?.forEach(listener => listener.callback(payload, event));
  }

  /**
   * Change the default event dispatcher.
   * @param dispatcher The new dispatcher to use.
  */
  public redirectDispatcher(dispatcher: Reciver): void {
    this.eventDispatcher = dispatcher;
    this.log("Core", "Dispatcher has been redirected.");
  }

  /**
   * Load modules from the provided path.
   * @param path The path to load modules from.
   * @param allowSubDirs If subdirectories should be allowed. Only index.js files will be loaded from subdirectories.
   * @returns A promise that resolves when all modules have been loaded.
  */
  public async loadModules(path: string, allowSubDirs: boolean = true): Promise<void> {
    path = `${process.cwd()}/${path}`;
    if (!fs.existsSync(path)) throw new Error(`[Cumsocket] Failed to load modules: path ${path} does not exist.`);
    
    // Load all modules from the provided path
    const files = fs.readdirSync(path, { withFileTypes: true });
    const targets: string[] = files.filter(v => !v.isDirectory() && v.name.endsWith(".js")).map(v => `${path}/${v.name}`);
    if (allowSubDirs) files.filter(v => v.isDirectory()).forEach(v => fs.existsSync(`${path}/${v.name}/index.js`) && targets.push(`${path}/${v.name}/index.js`));
  
    // Load all modules
    targets.forEach(async v => await this.loadModule(v, false, true));
  }


  /**
    Loads a module from the object constructor.
    @param constructor The constructor of the module to load.
  */
  public async loadModule(constructor: Object): Promise<void>;
  /**
    Loads a module from the provided path.
    @param path The path to the module to load.
    @param relative If the path is relative to the current working directory.
  */
  public async loadModule(path: string, relative?: boolean, ignoreOnFail?: boolean): Promise<void>;

  public async loadModule(target: string | Object, relative: boolean = true, ignoreOnFail: boolean = false): Promise<void> {
    const startStamp = Date.now();
    let obj: any = target;

    // If the target is a string, we need to import it
    if (typeof target === "string") {
      // Add .js extension if needed
      if (/(^|(?<=\/))[a-z]+$/.test(target)) target += ".js";
      
      // Create new path
      var path = relative ? `${process.cwd()}/${target}` : target;
      
      // Check if the path exists
      if (!fs.existsSync(path)) return error(`path ${path} does not exist.`);
      
      // Import the module
      const module = await import(path);
      
      // Check if the module exports a default export
      if (!module.default) return error(`module at path ${path} does not export a default export.`);
      obj = module.default;
      if (!this.isClass(obj)) return error(`module at path ${path} does not export a class constructor.`);
    }

    // Initialize the module
    const instance = new obj() as Module;

    // Check if the module should be ignored
    if (instance.ignore === true) return;

    
    // Check if the module contains a valid id
    const id = instance.id;
    if (id === undefined) return error(`module "${target.constructor.name}" does not contain an id;`);
    if (typeof id !== "string") return error(`module with id "${id}" has an invalid id type.`);
    if (this.loadedModules.some(v => v.id === id)) return error(`module with id "${id}" is already loaded.`);
    if (!/[a-z_]{1,16}/i.test(id)) return error(`module with id "${id}" has an invalid id structure.`);

    // Check if all required environment variables are set
    const env = instance.env;
    if (env instanceof Array) {
      // Check env array
      for (const key of env) {
        if (process.env[key] === undefined) return error(`module with id "${id}" requires environment variable "${key}" to be set.`, true);
        
        this._env[key] = process.env[key] as EnvType;
      }
    } else if (env) {
      if (typeof env !== "object") return error(`module with id "${id}" has an invalid environment variable list.`, true);

      // Check env object
      for (const [ key, value ] of Object.entries(env)) {
        const envValue = process.env[key];
        if (envValue === undefined) return error(`module with id "${id}" requires environment variable "${key}" to be set.`, true);
        
        switch (value) {
          // Check if the environment variable is a string
          case "string":
            this._env[key] = envValue;
            break;

          // Check if the environment variable is a number
          case "number":
            const num = envValue.replaceAll(/(?<=\d)_(?=\d)/g, "");
            if (!/^\d+(\.\d+)?$/.test(num)) return error(`module with id "${id}" requires environment variable "${key}" to be a number.`, true);
            this._env[key] = +num;
            break;

          // Check if the environment variable is a boolean
          case "boolean":
            if (!/^(true|false)$/i.test(envValue)) return error(`module with id "${id}" requires environment variable "${key}" to be a boolean.`, true);
            this._env[key] = envValue.toLowerCase() === "true";
            break;
        }
      }
    }

    // Apply context
    //@ts-ignore
    instance.ctx = this;

    // Register listeners
    const listeners = Client._listeners.filter(([object]) => object.isPrototypeOf(instance));
    for (const [_, callback, ...events] of listeners) for (const event of events) {
      if (!this.dispatchListeners[event]) this.dispatchListeners[event] = [];
      this.dispatchListeners[event].push({ id, callback: callback.bind(instance) });
    }

    // Remove registered listeners from static array
    Client._listeners = Client._listeners.filter(([object]) => !object.isPrototypeOf(instance));
    
    // Invoke init function
    instance.init?.(this);

    // Invoke ready if possible
    if (this._clientReady && this._userReady) instance.ready?.(this);

    // Add module to loaded modules list
    this.loadedModules.push(instance);

    // Log confirmation message
    this.log("Core", `Loaded module "${id}" with ${listeners.length} listeners. Took ${Date.now() - startStamp}ms.`);

    // Function for throwing errors
    function error(message: string, force: boolean = false): void | never {
      if (ignoreOnFail && !force) return;
      throw new Error(`[Cumsocket] Failed to load module: ${message}`);
    }
  }

  // Check if object is a class constructor
  private isClass(v: any): boolean {
    return Boolean(v && typeof v === "function" && v.prototype && !Object.getOwnPropertyDescriptor(v, "prototype")?.writable);
  }

  /**
   * Returns the storage instance if the database is available.
   * @returns The storage instance.
  */
  public get storage(): DBStorage | null {
    return this._storage ?? null;
  }

  /**
   * Returns the api object with all available api modules.
   * @returns The api object.
  */
  public get api(): ApiModules {
    return this._api.getApi();
  }

  /**
   * Add a task to the on-ready queue.
   * @param promise The promise to add to the queue.
  */
  public addReadyTask(promise: Promise<void>): void {
    this._readyTasks.push(promise);
  }

  /**
   * Returns the value of the environment variable with the provided key.
   * @param key The key of the environment variable to get.
   * @returns The value of the environment variable with the provided key.
  */
  public env<T extends EnvType = string>(key: string): T | undefined {
    return this._env[key] as T | undefined;
  }


  /**
   * Returns the list of all loaded listeners for the provided event.
   * @param event The event to get the listeners for.
   * @returns The list of all loaded listeners for the provided event.
  */
  public eventListeners(event: string): Listener[];

  /**
   * Returns the list of all loaded listeners
   * @returns The list of all loaded listeners
  */
  public eventListeners(): Listeners;

  public eventListeners(event?: string): Listeners | Listener[] {
    return event ? this.dispatchListeners[event] : this.dispatchListeners;
  }

  /**
   * Returns the list of all loaded module ids.
   * @returns The list of all loaded module ids.
  */
  public loadedIds(): string[] {
    return this.loadedModules.map(v => v.id);
  }

  /**
   * Sends a SQL query to the database.
   * @param query The SQL query to send.
   * @param args The arguments to replace in the query.
   * @returns The result of the query.
  */
  public async dbQuery(query: string, ...args: any[]): Promise<pg.QueryResult | null> {
    if (!this.postgres) return null;
    return await this.postgres.query(query.replaceAll(/\$\d+/g, v => args[+v.slice(1) - 1] ?? null));
  }
}

export interface Module {
  readonly env?: string[] | EnvConfig;
  readonly ctx?: Client;
  readonly ignore?: boolean;

  init?(ctx?: Client): Promise<void> | void;
  ready?(ctx?: Client): Promise<void> | void;
}

export abstract class Module {
  abstract readonly id: string;
}

type ClientOptions = {
  authorization: string;
  logs?: boolean;
  postgres?: string;
  autoReady?: boolean;
}
export type Listener = { id: string, callback: Reciver };
export type Listeners = { [key: string]: Listener[] };
type Reciver = (payload: any, event: string) => Promise<void> | void;
type EnvType = string | number | boolean;
export type EnvConfig = { [key: string]: "string" | "number" | "boolean"; };
