import { ApiModules } from "../api/index.js";
import DCClient from "../client/index.js";
import DBStorage from "./dbstorage.js";
import Socket from "./socket.js";
import pg from "pg";
export default class Client extends Socket {
    private static _listeners;
    /**
      (Decorator) Register a listener using @Client.listen("event1", "event2", ...)
    */
    static listen(...events: string[]): (target: Object, _: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;
    private readonly postgres?;
    private readonly postgresPromise?;
    private readonly loadedModules;
    private readonly _env;
    private readonly dispatchListeners;
    private eventDispatcher;
    private _clientReady;
    private _userReady;
    private readonly _api;
    private readonly _storage?;
    readonly client: DCClient;
    /**
      Initializes a new connection with discord using the provided authorization token.
      @param opt.authorization The authorization token to use.
      @param opt.logs If logs should be printed to the console.
      @param opt.postgres The postgres connection string to use.
    */
    constructor(opt: ClientOptions);
    /**
     * Call `ready` method on all modules when the client is entirely ready.
    */
    ready(): Promise<void>;
    private clientReady;
    private tryReady;
    private dispatcher;
    /**
     * Change the default event dispatcher.
     * @param dispatcher The new dispatcher to use.
    */
    redirectDispatcher(dispatcher: Reciver): void;
    /**
     * Load modules from the provided path.
     * @param path The path to load modules from.
     * @param allowSubDirs If subdirectories should be allowed. Only index.js files will be loaded from subdirectories.
     * @returns A promise that resolves when all modules have been loaded.
    */
    loadModules(path: string, allowSubDirs?: boolean): Promise<void>;
    /**
      Loads a module from the object constructor.
      @param constructor The constructor of the module to load.
    */
    loadModule(constructor: Object): Promise<void>;
    /**
      Loads a module from the provided path.
      @param path The path to the module to load.
      @param relative If the path is relative to the current working directory.
    */
    loadModule(path: string, relative: boolean): Promise<void>;
    private isClass;
    /**
     * Returns the storage instance if the database is available.
     * @returns The storage instance.
    */
    get storage(): DBStorage | null;
    /**
     * Returns the api object with all available api modules.
     * @returns The api object.
    */
    get api(): ApiModules;
    /**
     * Returns the value of the environment variable with the provided key.
     * @param key The key of the environment variable to get.
     * @returns The value of the environment variable with the provided key.
    */
    env<T extends EnvType = string>(key: string): T | undefined;
    /**
     * Returns the list of all loaded listeners for the provided event.
     * @param event The event to get the listeners for.
     * @returns The list of all loaded listeners for the provided event.
    */
    eventListeners(event: string): Listener[];
    /**
     * Returns the list of all loaded listeners
     * @returns The list of all loaded listeners
    */
    eventListeners(): Listeners;
    /**
     * Returns the list of all loaded module ids.
     * @returns The list of all loaded module ids.
    */
    loadedIds(): string[];
    /**
     * Sends a SQL query to the database.
     * @param query The SQL query to send.
     * @param args The arguments to replace in the query.
     * @returns The result of the query.
    */
    dbQuery(query: string, ...args: any[]): Promise<pg.QueryResult | null>;
}
export interface Module {
    readonly env?: string[] | EnvObject;
    readonly ctx?: Client;
    readonly ignore?: boolean;
    init?(ctx?: Client): Promise<void> | void;
    ready?(ctx?: Client): Promise<void> | void;
}
export declare abstract class Module {
    abstract readonly id: string;
}
type ClientOptions = {
    authorization: string;
    logs?: boolean;
    postgres?: string;
};
export type Listener = {
    id: string;
    callback: Reciver;
};
export type Listeners = {
    [key: string]: Listener[];
};
type Reciver = (payload: any, event: string) => Promise<void> | void;
type EnvType = string | number | boolean;
export type EnvObject = {
    [key: string]: "string" | "number" | "boolean";
};
export {};
