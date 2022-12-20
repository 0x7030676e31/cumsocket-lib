/// <reference types="node" resolution-mode="require"/>
import { Response } from "./net/index.js";
import { messages, users } from "./types/index.js";
import Api from "./index.js";
export default class {
    private readonly Net;
    private readonly Req;
    private readonly ctx;
    private attID;
    constructor(ctx: Api);
    send(channel_id: string, payload: messages.SendPayload): Response<messages.Message>;
    respond(channel_id: string, message_id: string, content: string, ping?: boolean): Response<messages.Message>;
    createAttachment(channel_id: string, files: messages.AttachmentSlotRequest[]): Response<{
        attachments: messages.AttachmentSlot[];
    }>;
    uplaodFiles(channel_id: string, ...files: {
        filename: string;
        content: Buffer | string;
    }[]): Response<{
        attachments: messages.AttachmentSlot[];
    }>;
    uploadFilesUrl(files: {
        content: Buffer | string;
        url: string;
    }[]): Promise<void>;
    edit(channel_id: string, messsage_id: string, payload: messages.SendPayload): Response<messages.Message>;
    delete(channel_id: string, message_id: string): Response<void>;
    get(channel_id: string, query: messages.GetQuery): Response<messages.Message[]>;
    typingIndicator(channel_id: string): Response<void>;
    reactionAdd(channel_id: string, message_id: string, reaction: string, query?: messages.ReactionQuery): Response<void>;
    reactionsGet(channel_id: string, message_id: string, reaction: string, query?: {
        limit: number;
    }): Response<users.Author[]>;
    reactionDelete(channel_id: string, message_id: string, reaction: string, user_id?: string, query?: {
        location: "Message";
    }): Response<void>;
    reactionDeleteEmoji(channel_id: string, message_id: string, reaction: string): Response<void>;
    reactionDeleteAll(channel_id: string, message_id: string): Response<void>;
}
