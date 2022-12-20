import { Response } from "./net/index.js";
import fetch from "node-fetch";
export default class {
    Net;
    Req;
    ctx;
    attID = 0;
    constructor(ctx) {
        this.Net = ctx.Net;
        this.Req = ctx.Req;
        this.ctx = ctx;
    }
    send(channel_id, payload) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/messages`)
            .useDefaultHeaders()
            .addNonce()
            .addBody(payload));
    }
    respond(channel_id, message_id, content, ping = false) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/messages`)
            .useDefaultHeaders()
            .addNonce()
            .addBody({
            content,
            message_reference: { channel_id: channel_id, message_id: message_id },
            allowed_mentions: { parse: ["everyone", "roles", "users"], replied_user: ping },
            tts: false,
        }));
    }
    createAttachment(channel_id, files) {
        files.forEach((file, idx, self) => file.id === undefined ? self[idx].id = (this.attID++).toString() : null);
        return this.Net.push(this.Req.new(`channels/${channel_id}/attachments`)
            .useDefaultHeaders()
            .addBody({ files }));
    }
    uplaodFiles(channel_id, ...files) {
        return new Response(new Promise(async (resolve) => {
            const attachments = this.createAttachment(channel_id, files.map(v => ({
                filename: v.filename,
                file_size: Buffer.byteLength(v.content),
            })));
            const response = await attachments.get();
            if (!response.ok)
                return resolve(response);
            const { attachments: slots } = response.data;
            await Promise.all(slots.map((slot, index) => fetch(slot.upload_url, {
                method: "PUT",
                headers: {
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Host": "discord-attachments-uploads-prd.storage.googleapis.com",
                    "Origin": "https://discord.com",
                    "Pragma": "no-cache",
                    "Referer": "discord.com",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "cross-site",
                    "TE": "trailers",
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0",
                },
                body: files[index].content,
            })));
            resolve({ ok: true, data: { attachments: slots } });
        }));
    }
    async uploadFilesUrl(files) {
        await Promise.all(files.map(v => fetch(v.url, {
            method: "PUT",
            headers: {
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Host": "discord-attachments-uploads-prd.storage.googleapis.com",
                "Origin": "https://discord.com",
                "Pragma": "no-cache",
                "Referer": "discord.com",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site",
                "TE": "trailers",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0",
            },
            body: v.content,
        })));
    }
    edit(channel_id, messsage_id, payload) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/messages`, `channels/${channel_id}/messages/${messsage_id}`)
            .setMethod("PATCH")
            .useDefaultHeaders()
            .addBody(payload));
    }
    delete(channel_id, message_id) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/messages`, `channels/${channel_id}/messages/${message_id}`)
            .setMethod("DELETE")
            .useDefaultHeaders());
    }
    get(channel_id, query) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/messages`)
            .setMethod("GET")
            .useDefaultHeaders()
            .addQuery(query));
    }
    typingIndicator(channel_id) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/typing`)
            .useDefaultHeaders());
    }
    reactionAdd(channel_id, message_id, reaction, query = { location: "Message", burst: false }) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}/@me`)
            .setMethod("PUT")
            .useDefaultHeaders()
            .addQuery(query));
    }
    reactionsGet(channel_id, message_id, reaction, query = { limit: 100 }) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}`)
            .setMethod("GET")
            .useDefaultHeaders()
            .addQuery(query));
    }
    reactionDelete(channel_id, message_id, reaction, user_id = "@me", query = { location: "Message" }) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}/${user_id}`)
            .setMethod("DELETE")
            .useDefaultHeaders()
            .addQuery(query));
    }
    reactionDeleteEmoji(channel_id, message_id, reaction) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions/${reaction}`)
            .setMethod("DELETE")
            .useDefaultHeaders());
    }
    reactionDeleteAll(channel_id, message_id) {
        return this.Net.push(this.Req.new(`channels/${channel_id}/reactions`, `channels/${channel_id}/messages/${message_id}/reactions`)
            .setMethod("DELETE")
            .useDefaultHeaders());
    }
}
//# sourceMappingURL=messages.js.map