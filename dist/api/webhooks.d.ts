import { Response } from "./net/index.js";
import { webhooks, messages } from "./types/index.js";
import Api from "./index.js";
export default class {
    private readonly Net;
    private readonly Req;
    private readonly ctx;
    constructor(ctx: Api);
    create(channel_id: string, webhook: webhooks.CreatePayload): Response<webhooks.Webhook>;
    getUnderChannel(channel_id: string): Response<webhooks.Webhook[]>;
    getUnderGuild(guild_id: string): Response<webhooks.Webhook[]>;
    get(webhook_id: string): Response<webhooks.Webhook>;
    getWithToken(webhook_id: string, webhook_token: string): Response<webhooks.Webhook>;
    edit(webhook_id: string, webhook: webhooks.ModifyPayload): Response<webhooks.Webhook>;
    remove(webhook_id: string): Response<null>;
    removeWithToken(webhook_id: string, webhook_token: string): Response<null>;
    execute(webhook_id: string, webhook_token: string, payload: webhooks.ExecutePayload, query?: webhooks.MsgExecuteQuery): Response<messages.Message>;
    getMessage(webhook_id: string, webhook_token: string, message_id: string, query?: webhooks.MsgQuery): Response<messages.Message>;
    editMessage(webhook_id: string, webhook_token: string, message_id: string, payload: webhooks.EditPayload, query?: webhooks.MsgQuery): Response<messages.Message>;
    deleteMessage(webhook_id: string, webhook_token: string, message_id: string, query?: webhooks.MsgQuery): Response<null>;
}
