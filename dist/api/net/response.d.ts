export type ResponseBody<T> = ResponseOK<T> | ResponseErr;
export type ResponseOK<T> = Promise<{
    ok: true;
    data: T;
}>;
export type ResponseErr = Promise<{
    ok: false;
    code: number;
    message: string;
    errors: any;
}>;
export declare class Response<T> {
    private pending;
    constructor(pending: ResponseBody<T>);
    unwrap(): Promise<T>;
    expect<C>(callback: (error?: {
        code?: number;
        message?: string;
        errors?: any;
    }) => Promise<C> | C): Promise<T | C>;
    expect<R>(returnValue: R): Promise<T | R>;
    expect(): Promise<T | void>;
    assume(): Promise<T | null>;
    get(): ResponseBody<T>;
    ignore(): Promise<T>;
    isOk(): Promise<boolean>;
}
