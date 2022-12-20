import * as Net from "./net/index.js";
import Webhooks from "./webhooks.js";
import Message from "./messages.js";
import Core from "../core/index.js";

export default class {
  public readonly Req: Net.Request;
  public readonly Net: Net.Network;

  public readonly webhooks!: Webhooks;
  public readonly messages!: Message;


  constructor(auth: string) {
    this.Req = new Net.Request(auth);
    this.Net = new Net.Network();

    this.webhooks = new Webhooks(this);
    this.messages = new Message(this);
  }

  public set referer(value: string) {
    this.Req.referer = `https://discord.com/${value}`;
  }

  public getApi(): ApiModules {
    return {
      webhooks: this.webhooks,
      messages: this.messages,
    }
  }
}

export interface ApiModules {
  webhooks: Webhooks;
  messages: Message;
}