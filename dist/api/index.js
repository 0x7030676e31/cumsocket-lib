import * as Net from "./net/index.js";
import Webhooks from "./webhooks.js";
import Message from "./messages.js";
export default class {
    Req;
    Net;
    webhooks;
    messages;
    constructor(auth) {
        this.Req = new Net.Request(auth);
        this.Net = new Net.Network();
        this.webhooks = new Webhooks(this);
        this.messages = new Message(this);
    }
    set referer(value) {
        this.Req.referer = `https://discord.com/${value}`;
    }
    getApi() {
        return {
            webhooks: this.webhooks,
            messages: this.messages,
        };
    }
}
//# sourceMappingURL=index.js.map