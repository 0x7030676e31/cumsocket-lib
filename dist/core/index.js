import Api from "../api/index.js";
import DCClient from "../client/index.js";
import Socket from "./socket.js";
import pg from "pg";
import fs from "fs";
export default class Client extends Socket {
    static _listeners = [];
    /**
      (Decorator) Register a listener using @Client.listen("event1", "event2", ...)
    */
    static listen(...events) {
        return (target, _, descriptor) => {
            Client._listeners.push([target, descriptor.value, ...events.map(v => v.toUpperCase())]);
            return descriptor;
        };
    }
    // PostgreSQL client
    postgres;
    // PostresSQL connection promise
    postgresPromise;
    // List of used modules
    loadedModules = [];
    // List of formatted environment variables
    _env = {};
    // List of callbacks to call when the client receives a specific event { event: [id, callback][] }
    dispatchListeners = {};
    // Callback to call when the client receives a dispatch
    eventDispatcher = this.dispatcher;
    // If client recieved a ready event
    _clientReady = false;
    _userReady = null;
    // Discord API wrapper
    _api;
    // Database storage
    _storage;
    // Discord client storage
    client = new DCClient(this);
    /**
      Initializes a new connection with discord using the provided authorization token.
      @param opt.authorization The authorization token to use.
      @param opt.logs If logs should be printed to the console.
      @param opt.postgres The postgres connection string to use.
    */
    constructor(opt) {
        super(opt.authorization, opt.logs ?? false);
        this._api = new Api(opt.authorization);
        if (opt.autoReady)
            this.ready();
        // Register listeners
        this.once("ready", this.clientReady.bind(this));
        this.on("dispatch", async (d, t) => this.eventDispatcher(d, t));
        this.on("dispatch", async (d, t) => this.client.dispatch(d, t));
        // Initialize postgres client
        if (!opt.postgres)
            return;
        this.postgres = new pg.Client({ connectionString: opt.postgres, ssl: { rejectUnauthorized: false } });
        this.postgresPromise = this.postgres.connect();
        this.log("Core", "Initialized postgres client.");
    }
    /**
     * Call `ready` method on all modules when the client is entirely ready.
    */
    ready() {
        if (this._userReady !== null)
            throw new Error("[Cumsocket] Cannot emit ready event twice.");
        return new Promise(resolve => {
            this._userReady = resolve;
            this.tryReady();
        });
    }
    // Do every on-ready tasks and try to execute ready method on all modules
    clientReady() {
        // Tasks to do
        Promise.all([
            this.postgresPromise,
            this._storage?.sync(),
        ]).then(() => {
            this._clientReady = true;
            this.tryReady();
        });
    }
    // Try to execute ready method on all modules
    async tryReady() {
        // Check if both the client and user are ready
        if (!this._userReady || !this._clientReady)
            return;
        // Execute ready method on all modules
        await Promise.all(this.loadedModules.map(v => v.ready?.(this)));
        this.log("Core", "Executed ready method on all modules.");
        // Resolve ready promise
        this._userReady();
    }
    async dispatcher(payload, event) {
        this.dispatchListeners[event]?.forEach(listener => listener.callback(payload, event));
    }
    /**
     * Change the default event dispatcher.
     * @param dispatcher The new dispatcher to use.
    */
    redirectDispatcher(dispatcher) {
        this.eventDispatcher = dispatcher;
        this.log("Core", "Dispatcher has been redirected.");
    }
    /**
     * Load modules from the provided path.
     * @param path The path to load modules from.
     * @param allowSubDirs If subdirectories should be allowed. Only index.js files will be loaded from subdirectories.
     * @returns A promise that resolves when all modules have been loaded.
    */
    async loadModules(path, allowSubDirs = true) {
        path = `${process.cwd()}/${path}`;
        if (!fs.existsSync(path))
            throw new Error(`[Cumsocket] Failed to load modules: path ${path} does not exist.`);
        // Load all modules from the provided path
        const files = fs.readdirSync(path, { withFileTypes: true });
        const targets = files.filter(v => !v.isDirectory() && v.name.endsWith(".js")).map(v => `${path}/${v.name}`);
        if (allowSubDirs)
            files.filter(v => v.isDirectory()).forEach(v => fs.existsSync(`${path}/${v.name}/index.js`) && targets.push(`${path}/${v.name}/index.js`));
        // Load all modules
        targets.forEach(async (v) => await this.loadModule(v, false, true));
    }
    async loadModule(target, relative = true, ignoreOnFail = false) {
        const startStamp = Date.now();
        let obj = target;
        // If the target is a string, we need to import it
        if (typeof target === "string") {
            // Add .js extension if needed
            if (/(^|(?<=\/))[a-z]+$/.test(target))
                target += ".js";
            // Create new path
            var path = relative ? `${process.cwd()}/${target}` : target;
            // Check if the path exists
            if (!fs.existsSync(path))
                return error(`path ${path} does not exist.`);
            // Import the module
            const module = await import(path);
            // Check if the module exports a default export
            if (!module.default)
                return error(`module at path ${path} does not export a default export.`);
            obj = module.default;
            if (!this.isClass(obj))
                return error(`module at path ${path} does not export a class constructor.`);
        }
        // Initialize the module
        const instance = new obj();
        // Check if the module should be ignored
        if (instance.ignore === true)
            return;
        // Check if the module contains a valid id
        const id = instance.id;
        if (id === undefined)
            return error(`module "${target.constructor.name}" does not contain an id;`);
        if (typeof id !== "string")
            return error(`module with id "${id}" has an invalid id type.`);
        if (this.loadedModules.some(v => v.id === id))
            return error(`module with id "${id}" is already loaded.`);
        if (!/[a-z_]{1,16}/i.test(id))
            return error(`module with id "${id}" has an invalid id structure.`);
        // Check if all required environment variables are set
        const env = instance.env;
        if (env instanceof Array) {
            // Check env array
            for (const key of env) {
                if (process.env[key] === undefined)
                    return error(`module with id "${id}" requires environment variable "${key}" to be set.`);
                this._env[key] = process.env[key];
            }
        }
        else if (env) {
            if (typeof env !== "object")
                return error(`module with id "${id}" has an invalid environment variable list.`);
            // Check env object
            for (const [key, value] of Object.entries(env)) {
                const envValue = process.env[key];
                if (envValue === undefined)
                    return error(`module with id "${id}" requires environment variable "${key}" to be set.`);
                switch (value) {
                    // Check if the environment variable is a string
                    case "string":
                        this._env[key] = envValue;
                        break;
                    // Check if the environment variable is a number
                    case "number":
                        const num = envValue.replaceAll(/(?<=\d)_(?=\d)/g, "");
                        if (!/^\d+(\.\d+)?$/.test(num))
                            return error(`module with id "${id}" requires environment variable "${key}" to be a number.`);
                        this._env[key] = +num;
                        break;
                    // Check if the environment variable is a boolean
                    case "boolean":
                        if (!/^(true|false)$/i.test(envValue))
                            return error(`module with id "${id}" requires environment variable "${key}" to be a boolean.`);
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
        for (const [_, callback, ...events] of listeners)
            for (const event of events) {
                if (!this.dispatchListeners[event])
                    this.dispatchListeners[event] = [];
                this.dispatchListeners[event].push({ id, callback: callback.bind(instance) });
            }
        // Remove registered listeners from static array
        Client._listeners = Client._listeners.filter(([object]) => !object.isPrototypeOf(instance));
        // Invoke init function
        instance.init?.(this);
        // Invoke ready if possible
        if (this._clientReady && this._userReady)
            instance.ready?.(this);
        // Add module to loaded modules list
        this.loadedModules.push(instance);
        // Log confirmation message
        this.log("Core", `Loaded module "${id}" with ${listeners.length} listeners. Took ${Date.now() - startStamp}ms.`);
        // Function for throwing errors
        function error(message) {
            if (ignoreOnFail)
                return;
            throw new Error(`[Cumsocket] Failed to load module: ${message}`);
        }
    }
    // Check if object is a class constructor
    isClass(v) {
        return Boolean(v && typeof v === "function" && v.prototype && !Object.getOwnPropertyDescriptor(v, "prototype")?.writable);
    }
    /**
     * Returns the storage instance if the database is available.
     * @returns The storage instance.
    */
    get storage() {
        return this._storage ?? null;
    }
    /**
     * Returns the api object with all available api modules.
     * @returns The api object.
    */
    get api() {
        return this._api.getApi();
    }
    /**
     * Returns the value of the environment variable with the provided key.
     * @param key The key of the environment variable to get.
     * @returns The value of the environment variable with the provided key.
    */
    env(key) {
        return this._env[key];
    }
    eventListeners(event) {
        return event ? this.dispatchListeners[event] : this.dispatchListeners;
    }
    /**
     * Returns the list of all loaded module ids.
     * @returns The list of all loaded module ids.
    */
    loadedIds() {
        return this.loadedModules.map(v => v.id);
    }
    /**
     * Sends a SQL query to the database.
     * @param query The SQL query to send.
     * @param args The arguments to replace in the query.
     * @returns The result of the query.
    */
    async dbQuery(query, ...args) {
        if (!this.postgres)
            return null;
        return await this.postgres.query(query.replaceAll(/\{\d+\}/g, (_, idx) => args[+idx - 1] ?? null));
    }
}
export class Module {
}
//# sourceMappingURL=index.js.map