import * as Net from "./net/index.js";
import Webhooks from "./webhooks.js";
import Message from "./messages.js";
export default class {
    readonly Req: Net.Request;
    readonly Net: Net.Network;
    readonly webhooks: Webhooks;
    readonly messages: Message;
    constructor(auth: string);
    set referer(value: string);
    getApi(): ApiModules;
}
export interface ApiModules {
    webhooks: Webhooks;
    messages: Message;
}
