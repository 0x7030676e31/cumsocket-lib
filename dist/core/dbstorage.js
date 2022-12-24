export default class DBStorage {
    ctx;
    local = new Map();
    constructor(ctx) {
        this.ctx = ctx;
    }
    // Load database entries into local cache
    async sync() {
        this.ctx.log("DBStorage", "Fetching database entries into local cache...");
        const fetchingMs = Date.now();
        await this.ctx.dbQuery("CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT);");
        const res = (await this.ctx.dbQuery("SELECT * FROM storage;")).rows;
        res.forEach(v => this.local.set(v.key, v.value));
        this.ctx.log("DBStorage", `Loaded ${res.length} entries from the database. Took ${Date.now() - fetchingMs}ms`);
    }
    // Get a value from the local cache
    get(key) {
        return this.local.get(key) ?? null;
    }
    // Set a value in the local cache and database
    async set(key, value) {
        // Update database
        if (this.local.has(key))
            this.ctx.dbQuery("UPDATE storage SET value = '$1' WHERE key = '$2';", value, key);
        else
            this.ctx.dbQuery("INSERT INTO storage (key, value) VALUES ('$1', '$2');", key, value);
        // Update local cache
        this.local.set(key, value.toString());
    }
    // Set a value in the local cache and database if it doesn't exist
    async setIfNotExists(key, value) {
        if (!this.local.has(key))
            await this.set(key, value);
    }
    // Set a value in the local cache and database if it's different
    async setIfDiff(key, value) {
        if (this.local.get(key) !== value)
            await this.set(key, value);
    }
    // Check if a key exists in the local cache
    has(key) {
        return this.local.has(key);
    }
    // Delete a key from the local cache and database
    async delete(key) {
        // Update database
        this.ctx.dbQuery("DELETE FROM storage WHERE key = '$1';", key);
        // Update local cache
        this.local.delete(key);
    }
    // Numeric operations
    // Add a value to a numeric value
    async numericIncr(key, value = 1) {
        const raw = this.local.get(key);
        if (raw === undefined || Number.isNaN(raw))
            throw new Error(`Storage Error: Cannot increment non-numeric value "${key}"`);
        const num = Number(raw) + value;
        await this.set(key, num.toString());
        return num;
    }
    // Subtract a value from a numeric value
    async numericDecr(key, value = 1) {
        const raw = this.local.get(key);
        if (raw === undefined || Number.isNaN(raw))
            throw new Error(`Storage Error: Cannot decrement non-numeric value "${key}"`);
        const num = Number(raw) - value;
        await this.set(key, num.toString());
        return num;
    }
    // Get a numeric value
    numericGet(key) {
        const raw = this.local.get(key);
        if (raw === undefined || Number.isNaN(raw))
            throw new Error(`Storage Error: Cannot get non-numeric value "${key}"`);
        return Number(raw);
    }
    // Set a numeric value
    async numericSet(key, value) {
        await this.set(key, value.toString());
    }
    // Boolean operations
    // Set a boolean value to true
    async booleanSetTrue(key) {
        await this.set(key, "true");
    }
    // Set a boolean value to false
    async booleanSetFalse(key) {
        await this.set(key, "false");
    }
    // Toggle a boolean value
    async booleanToggle(key) {
        const raw = this.local.get(key)?.toLowerCase();
        if (raw === undefined || !/^(true|false)$/.test(raw))
            throw new Error(`Storage Error: Cannot toggle non-boolean value "${key}"`);
        const bool = raw === "true" ? false : true;
        await this.set(key, bool.toString());
        return bool;
    }
    // Set a boolean value
    async booleanSet(key, value) {
        await this.set(key, value.toString());
    }
    // Get a boolean value
    booleanGet(key) {
        const raw = this.local.get(key)?.toLowerCase();
        if (raw === undefined || !/^(true|false)$/.test(raw))
            throw new Error(`Storage Error: Cannot get non-boolean value "${key}"`);
        return raw === "true" ? true : false;
    }
    // Check if a boolean value is true
    booleanIsTrue(key) {
        const raw = this.local.get(key)?.toLowerCase();
        if (raw === undefined || !/^(true|false)$/.test(raw))
            throw new Error(`Storage Error: Cannot check non-boolean value "${key}"`);
        return raw === "true" ? true : false;
    }
    // String operations
    // Append a string to a string value
    async stringAppend(key, value) {
        const raw = this.local.get(key);
        if (raw === undefined)
            throw new Error(`Storage Error: Cannot append to non-string value "${key}"`);
        const str = raw + value;
        await this.set(key, str);
        return str;
    }
    // Prepend a string to a string value
    async stringPrepend(key, value) {
        const raw = this.local.get(key);
        if (raw === undefined)
            throw new Error(`Storage Error: Cannot prepend to non-string value "${key}"`);
        const str = value + raw;
        await this.set(key, str);
        return str;
    }
}
//# sourceMappingURL=dbstorage.js.map