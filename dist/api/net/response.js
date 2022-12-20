export class Response {
    pending;
    constructor(pending) {
        this.pending = pending;
    }
    // Returns the response data if the response was successful, otherwise throws an error
    async unwrap() {
        const res = await this.pending;
        if (res.ok)
            return res.data;
        console.trace("Fetch unwrapping panicked");
        console.log(`Code: ${res.code}\nMessage: ${res.message}\nErrors: ${JSON.stringify(res.errors, null, 2)}`);
        process.exit(1);
    }
    async expect(returnValue) {
        const res = await this.pending;
        if (res.ok)
            return res.data;
        if (returnValue && typeof returnValue === "function")
            return await returnValue({ code: res.code, message: res.message, errors: res.errors });
    }
    // Returns the response data assuming the response was successful, otherwise return null
    async assume() {
        const res = await this.pending;
        if (res.ok)
            return res.data;
        return null;
    }
    // Returns raw promise, use this if you want to handle the response yourself
    get() {
        return this.pending;
    }
    // Returns the response data assuming the response was successful
    async ignore() {
        return (await this.pending).data;
    }
    // Returns boolean indicating if the response was successful
    async isOk() {
        return (await this.pending).ok;
    }
}
//# sourceMappingURL=response.js.map