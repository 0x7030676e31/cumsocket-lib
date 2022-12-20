export declare class Request {
    protected readonly version: string;
    private readonly auth;
    referer: string;
    private _url?;
    private _bucket?;
    private _method;
    private _query;
    private _body?;
    private _headers?;
    constructor(auth: string);
    private readonly _properties;
    new(bucket: string, url?: string): this;
    setMethod(method: Method): this;
    addQuery(query?: {
        [key: string]: any;
    }): this;
    addBody(body?: {
        [key: string]: string | any;
    }): this;
    addNonce(): this;
    useDefaultHeaders(without?: string[]): this;
    addHeaders(headers?: {
        [key: string]: string;
    }): this;
    build(): RequestData;
}
export type Method = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
export interface RequestData {
    bucket: string;
    url: string;
    method: Method;
    body?: string;
    headers?: {
        [key: string]: string;
    };
}
