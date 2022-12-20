import { Response } from "./response.js";
import { Request } from "./request.js";
export default class Network {
    private globalCooldown;
    private globalQueue;
    private queue;
    private workingBuckets;
    push<T>(request: Request): Response<T>;
    private resolveGlobal;
    private fetch;
}
