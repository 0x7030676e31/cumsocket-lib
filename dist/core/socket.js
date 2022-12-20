import { EventEmitter } from "events";
import op2 from "../op2.json" assert { type: "json" };
import * as log from "../log.js";
import WebSocket from "ws";
class Socket extends EventEmitter {
    // Id tracking for logging
    static id = 0;
    static getId() {
        return "ws-" + (Socket.id++).toString();
    }
    url = "wss://gateway.discord.gg/?encoding=json&v=10";
    token;
    // Websocket connection
    _ws;
    // Interval object for heartbeats
    _hbInterval;
    // Sequence number
    _seq = 0;
    // Session ID (used for resuming)
    _sessionId = "";
    // Resume URL (used for resuming)
    _resumeUrl = "";
    // Id used for logging
    id;
    // Codes that should cause the client to close the connection
    _badCodes = [4004, 4010, 4011, 4013, 4014];
    constructor(token, printLogs) {
        super();
        this.id = Socket.getId();
        log.register(this.id, printLogs);
        this.log("Gateway", "Starting up...");
        this.token = token;
        this.connect();
    }
    // Handle the websocket on open event
    async onOpen(re) {
        this.emit("open", re);
        this.log("Gateway", "Connection established.");
        // Sent authentication payload
        this._ws.send(this.getInitPayload(re));
    }
    // Handle an incoming message payload
    async onMessage(data) {
        const { op, d, t } = JSON.parse(data);
        switch (op) {
            case OpCodes.DISPATCH:
                this._seq++;
                this.emit("dispatch", d, t);
                if (t === "READY") {
                    this._sessionId = d.session_id;
                    this._resumeUrl = d.resume_gateway_url;
                    this.emit("ready", d);
                    return;
                }
                if (t === "RESUMED") {
                    this.emit("resume", d);
                    this.log("Gateway", "Session resumed successfully.");
                }
                break;
            // Client should send a heartbeat rn
            case 1:
                this.heartbeat();
                break;
            // Client have to reconnect
            case 7:
                this.log("Gateway", "Server is requesting a reconnect.");
                this.connect(true);
                break;
            // Session has been invalidated and client should eventaully reconnect
            case OpCodes.INVALID_SESSION:
                this.log("Gateway", "Session invalidated.");
                this.connect(d === true);
                break;
            // "Hello" message
            case OpCodes.HELLO:
                this.log("Gateway", "Discord is saying hello!");
                this._hbInterval = setInterval(this.heartbeat.bind(this), d.heartbeat_interval);
                break;
            // Heartbeat ack message
            case OpCodes.HEARTBEAT_ACK:
                this.emit("ack", this._seq);
                break;
        }
    }
    // Send a heartbeat payload
    async heartbeat() {
        this.emit("heartbeat", this._seq);
        this._ws?.send(JSON.stringify({ op: OpCodes.HEARTBEAT, d: this._seq }));
    }
    // Handle the websocket closing event
    async onClose(code) {
        this.emit("close", code);
        if (this._badCodes.includes(code)) {
            this.log("Gateway", `Gateway closed with code ${code}!`);
            process.exit(1);
        }
        this.log("Gateway", `Gateway closed with code ${code}! Reconnecting...`);
        this.connect();
    }
    // Generate an init payload for creating/resuming a session
    getInitPayload(re = false) {
        if (re)
            return JSON.stringify({
                op: OpCodes.RESUME,
                d: {
                    token: this.token,
                    session_id: this._sessionId,
                    seq: this._seq,
                }
            });
        const payload = structuredClone(op2);
        payload.d.token = this.token;
        return JSON.stringify(payload);
    }
    // (Re) Connect to the gateway
    async connect(re = false) {
        if (!re)
            this._seq = 0;
        this.prepare();
        // Create a new websocket connection
        const ws = this._ws = new WebSocket(re ? this._resumeUrl : this.url);
        this.log("Gateway", re ? "Attempting to reconnect..." : "Connecting...");
        // Add event listeners
        ws.once("open", this.onOpen.bind(this, re));
        ws.once("close", this.onClose.bind(this));
        ws.on("message", this.onMessage.bind(this));
    }
    // Remove all listeners and clear the heartbeat interval - do things before reconnecting
    prepare() {
        clearInterval(this._hbInterval);
        this._ws?.removeAllListeners();
        this._ws?.close();
    }
    // Get current sequence number
    get seq() {
        return this._seq;
    }
    // Disconnect from the gateway and eventaully exit the process
    async disconnect(reconnect = false) {
        this.log("Gateway", "Disconnecting...");
        this._ws.close(1000);
        if (reconnect)
            this.connect();
        else
            process.exit(0);
    }
    // Update the client's presence (op 3)
    async presenceUpdate(presence) {
        this._ws.send(JSON.stringify({ op: OpCodes.PRESENCE_UPDATE, d: presence }));
    }
    // Update user voice settings (op 4)
    async voiceStateUpdate(payload) {
        this._ws.send(JSON.stringify({ op: 4, d: payload }));
    }
    // Confirm that user opened direct message channel, required to not get banned (op 13, undocumented)
    async dmConfirmation(id) {
        this._ws.send(JSON.stringify({ op: OpCodes.DM_CONFIRMATION, d: { channel_id: id } }));
    }
    // Log a message to the console displaying the uptime
    log(header, message) {
        log.print(this.id, message === undefined ? { message: header } : { header, message });
    }
}
var OpCodes;
(function (OpCodes) {
    OpCodes[OpCodes["DISPATCH"] = 0] = "DISPATCH";
    OpCodes[OpCodes["HEARTBEAT"] = 1] = "HEARTBEAT";
    OpCodes[OpCodes["IDENTIFY"] = 2] = "IDENTIFY";
    OpCodes[OpCodes["PRESENCE_UPDATE"] = 3] = "PRESENCE_UPDATE";
    OpCodes[OpCodes["VOICE_STATE_UPDATE"] = 4] = "VOICE_STATE_UPDATE";
    OpCodes[OpCodes["RESUME"] = 6] = "RESUME";
    OpCodes[OpCodes["RECONNECT"] = 7] = "RECONNECT";
    OpCodes[OpCodes["REQUEST_GUILD_MEMBERS"] = 8] = "REQUEST_GUILD_MEMBERS";
    OpCodes[OpCodes["INVALID_SESSION"] = 9] = "INVALID_SESSION";
    OpCodes[OpCodes["HELLO"] = 10] = "HELLO";
    OpCodes[OpCodes["HEARTBEAT_ACK"] = 11] = "HEARTBEAT_ACK";
    // UNKNOWN = 12,
    OpCodes[OpCodes["DM_CONFIRMATION"] = 13] = "DM_CONFIRMATION";
})(OpCodes || (OpCodes = {}));
export default Socket;
//# sourceMappingURL=socket.js.map