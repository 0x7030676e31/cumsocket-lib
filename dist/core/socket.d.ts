/// <reference types="node" resolution-mode="require"/>
import { EventEmitter } from "events";
declare class Socket extends EventEmitter {
    private static id;
    private static getId;
    protected readonly url = "wss://gateway.discord.gg/?encoding=json&v=10";
    protected readonly token: string;
    private _ws;
    private _hbInterval;
    private _seq;
    private _sessionId;
    private _resumeUrl;
    private readonly id;
    private readonly _badCodes;
    constructor(token: string, printLogs: boolean);
    private onOpen;
    private onMessage;
    private heartbeat;
    private onClose;
    private getInitPayload;
    private connect;
    private prepare;
    get seq(): number;
    disconnect(reconnect?: boolean): Promise<void>;
    presenceUpdate(presence: Presence): Promise<void>;
    voiceStateUpdate(payload: VoiceState): Promise<void>;
    dmConfirmation(id: string): Promise<void>;
    log(message: string): void;
    log(header: string, message: string): void;
}
interface Presence {
    status: "online" | "dnd" | "idle" | "invisible";
    since: number;
    activities: (Activity0 | Activity4)[];
    afk: boolean;
}
interface Activity4 {
    type: 4;
    name: "Custom Status";
    state: string;
    emoji: string | null;
}
interface Activity0 {
    type: 0;
    application_id: string;
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    };
    details?: string;
    name?: string;
    state?: string;
    timestamps?: {
        start: number;
    } | {
        end: number;
    };
    buttons?: [string?, string?];
    metadata?: {
        button_urls?: [string?, string?];
    };
}
interface VoiceState {
    guild_id: string | null;
    channel_id: string | null;
    self_mute: boolean;
    self_deaf: boolean;
    self_video: boolean;
}
type Hello = {
    heartbeat_interval: number;
};
type AsyncOr = Promise<void> | void;
interface Events {
    open: (reconnecting: boolean) => AsyncOr;
    close: (code: number) => AsyncOr;
    ready: (data: any) => AsyncOr;
    dispatch: (data: any, event: string) => AsyncOr;
    heartbeat: (seq: number) => AsyncOr;
    ack: (seq: number) => AsyncOr;
    hello: (data: Hello) => AsyncOr;
    resume: (seq: number) => AsyncOr;
}
declare interface Socket {
    addListener<U extends keyof Events>(event: U, listener: Events[U]): this;
    on<U extends keyof Events>(event: U, listener: Events[U]): this;
    once<U extends keyof Events>(event: U, listener: Events[U]): this;
    removeListener<U extends keyof Events>(event: U, listener: Events[U]): this;
    off<U extends keyof Events>(event: U, listener: Events[U]): this;
    removeAllListeners<U extends keyof Events>(event?: U): this;
    listeners<U extends keyof Events>(event: U): Events[U][];
    rawListeners<U extends keyof Events>(event: U): Events[U][];
    emit<U extends keyof Events>(event: U, ...args: Parameters<Events[U]>): boolean;
    listenerCount<U extends keyof Events>(event: U): number;
    prependListener<U extends keyof Events>(event: U, listener: Events[U]): this;
    prependOnceListener<U extends keyof Events>(event: U, listener: Events[U]): this;
}
export default Socket;
