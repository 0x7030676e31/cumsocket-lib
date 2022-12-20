export default class {
    Net;
    Req;
    ctx;
    constructor(ctx) {
        this.Net = ctx.Net;
        this.Req = ctx.Req;
        this.ctx = ctx;
    }
    create(channel_id, webhook) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/webhooks`)
            .useDefaultHeaders()
            .addBody(webhook));
    }
    getUnderChannel(channel_id) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/webhooks`)
            .setMethod("GET")
            .useDefaultHeaders());
    }
    getUnderGuild(guild_id) {
        return this.Net.push(this.Req.new(`guilds/${guild_id}/webhooks`)
            .setMethod("GET")
            .useDefaultHeaders());
    }
    get(webhook_id) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}`)
            .setMethod("GET")
            .useDefaultHeaders());
    }
    getWithToken(webhook_id, webhook_token) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}/${webhook_token}`)
            .setMethod("GET")
            .addHeaders({ "Content-Type": "application/json" }));
    }
    edit(webhook_id, webhook) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}`)
            .setMethod("PATCH")
            .useDefaultHeaders()
            .addBody(webhook));
    }
    remove(webhook_id) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}`)
            .setMethod("DELETE")
            .useDefaultHeaders());
    }
    removeWithToken(webhook_id, webhook_token) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}/${webhook_token}`)
            .setMethod("DELETE")
            .addHeaders({ "Content-Type": "application/json" }));
    }
    execute(webhook_id, webhook_token, payload, query) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}/${webhook_token}`)
            .addQuery(query)
            .addBody(payload)
            .addHeaders({ "Content-Type": "application/json" }));
    }
    getMessage(webhook_id, webhook_token, message_id, query) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}`, `webhooks/${webhook_id}/${webhook_token}/messages/${message_id}`)
            .setMethod("GET")
            .addQuery(query)
            .addHeaders({ "Content-Type": "application/json" }));
    }
    editMessage(webhook_id, webhook_token, message_id, payload, query) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}`, `webhooks/${webhook_id}/${webhook_token}/messages/${message_id}`)
            .setMethod("PATCH")
            .addQuery(query)
            .addBody(payload)
            .addHeaders({ "Content-Type": "application/json" }));
    }
    deleteMessage(webhook_id, webhook_token, message_id, query) {
        return this.Net.push(this.Req.new(`webhooks/${webhook_id}`, `webhooks/${webhook_id}/${webhook_token}/messages/${message_id}`)
            .setMethod("DELETE")
            .addQuery(query)
            .addHeaders({ "Content-Type": "application/json" }));
    }
}
//# sourceMappingURL=webhooks.js.map