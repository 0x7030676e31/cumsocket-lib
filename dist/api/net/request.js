import op2 from "../../op2.json" assert { type: "json" };
export class Request {
    version = "v9";
    auth;
    referer = "https://discord.com/channels/@me";
    _url;
    _bucket;
    _method = "POST";
    _query = {};
    _body;
    _headers;
    constructor(auth) {
        this.auth = auth;
    }
    // "X-Discord-Properties" header value
    _properties = Buffer.from(JSON.stringify(op2.d.properties)).toString("base64");
    // Create a new request
    new(bucket, url) {
        this._url = `https://discord.com/api/${this.version}/${url ?? bucket}`;
        this._bucket = bucket;
        return this;
    }
    // Set the request method
    setMethod(method) {
        this._method = method;
        return this;
    }
    // Add a query to the request
    addQuery(query) {
        if (!query)
            return this;
        if (!this._query)
            this._query = {};
        Object.assign(this._query, query);
        return this;
    }
    // Add a body to the request
    addBody(body) {
        if (!body)
            return this;
        if (!this._body)
            this._body = {};
        Object.assign(this._body, body);
        return this;
    }
    // Add a nonce to the request based on the Discord Epoch
    addNonce() {
        this.addBody({ nonce: ((BigInt(new Date().getTime()) - 1420070400000n) << 22n).toString() });
        return this;
    }
    // Use default headers for the request
    useDefaultHeaders(without) {
        if (!this._headers)
            this._headers = {};
        without = without ?? [];
        Object.assign(this._headers, Object.fromEntries(Object.entries({
            "Alt-used": "discord.com",
            "Authorization": this.auth,
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "Cookie": "",
            "Host": "discord.com",
            "Origin": "https://discord.com",
            "Pragma": "no-cache",
            // "Referer": this.referer,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "TE": "trailers",
            "User-Agent": op2.d.properties.browser_user_agent,
            "X-Debug-Options": "bugReporterEnabled",
            "X-Discord-Locale": "en-US",
            "X-Discord-Properties": this._properties,
        }).filter(([key]) => !without.includes(key))));
        return this;
    }
    // Adds headers to the request
    addHeaders(headers) {
        if (!headers)
            return this;
        if (!this._headers)
            this._headers = {};
        Object.assign(this._headers, headers);
        return this;
    }
    // Returns the request data
    build() {
        if (Object.keys(this._query).length)
            var query = "?" + Object.entries(this._query).map(([key, value]) => `${key}=${value}`).join("&");
        const url = encodeURI(this._url + (query ?? ""));
        const body = this._body ? JSON.stringify(this._body) : undefined;
        return { bucket: this._bucket, url, method: this._method, body, headers: this._headers };
    }
}
//# sourceMappingURL=request.js.map