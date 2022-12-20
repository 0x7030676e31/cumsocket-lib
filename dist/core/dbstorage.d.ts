import Core from "./index.js";
export default class DBStorage {
    private ctx;
    private local;
    constructor(ctx: Core);
    sync(): Promise<void>;
    get(key: string): string | null;
    set(key: string, value: string): Promise<void>;
    setIfNotExists(key: string, value: string): Promise<void>;
    setIfDiff(key: string, value: string): Promise<void>;
    has(key: string): boolean;
    delete(key: string): Promise<void>;
    numericIncr(key: string, value?: number): Promise<number>;
    numericDecr(key: string, value?: number): Promise<number>;
    numericGet(key: string): number;
    numericSet(key: string, value: number): Promise<void>;
    booleanSetTrue(key: string): Promise<void>;
    booleanSetFalse(key: string): Promise<void>;
    booleanToggle(key: string): Promise<boolean>;
    booleanSet(key: string, value: boolean): Promise<void>;
    booleanGet(key: string): boolean;
    booleanIsTrue(key: string): boolean;
    stringAppend(key: string, value: string): Promise<string>;
    stringPrepend(key: string, value: string): Promise<string>;
}
