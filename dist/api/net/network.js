import { Response } from "./response.js";
import fetch from "node-fetch";
// Used to send requests to the Discord API and handle rate limits
export default class Network {
    // Global cooldown?
    globalCooldown = false;
    // Queue if global cooldown is active
    globalQueue = [];
    // Queue of requests for each bucket
    queue = {};
    // List of active buckets
    workingBuckets = [];
    // Push a request to the queue
    push(request) {
        return new Response(new Promise(resolve => {
            // Build the request and push it to the queue
            const req = request.build();
            if (!this.queue[req.bucket])
                this.queue[req.bucket] = [];
            this.queue[req.bucket].push({ resolve, request: req });
            // Schedule the request
            if (this.globalCooldown && !this.globalQueue.includes(req.bucket))
                this.globalQueue.push(req.bucket);
            else if (!this.workingBuckets.includes(req.bucket))
                this.fetch(req.bucket);
        }));
    }
    // Resolve all buckets in the global queue
    async resolveGlobal() {
        this.globalCooldown = false;
        // Schedule all buckets in the global queue
        for (const bucket of this.globalQueue) {
            this.fetch(bucket);
            await new Promise((res) => setTimeout(res, 50));
            if (this.globalCooldown)
                return;
        }
        // Clear the global queue
        this.globalQueue = [];
    }
    // Fetch from a bucket
    async fetch(bucket) {
        if (!this.workingBuckets.includes(bucket))
            this.workingBuckets.push(bucket);
        const next = this.queue[bucket][0];
        const data = next.request;
        // Send the request
        const request = await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body,
        });
        const { status } = request;
        // Handle rate limit
        if (status === 429) {
            const response = await request.json();
            // Bucket rate limit
            if (!response.global) {
                setTimeout(this.fetch.bind(this, bucket), response.retry_after * 1000);
                return;
            }
            // Global rate limit
            this.workingBuckets.splice(this.workingBuckets.indexOf(bucket), 1);
            this.globalCooldown = true;
            setTimeout(this.resolveGlobal.bind(this), response.retry_after * 1000);
            return;
        }
        // Remove the request from the queue
        this.queue[bucket].shift();
        // Schedule next request
        if (this.queue[bucket].length)
            setTimeout(this.fetch.bind(this, bucket), 50);
        else
            this.workingBuckets.splice(this.workingBuckets.indexOf(bucket), 1);
        // Resolve the request and return the Response object
        next.resolve(request.ok ? { ok: true, data: status === 204 ? undefined : await request.json() } : { ok: false, ...await request.json() });
    }
}
//# sourceMappingURL=network.js.map