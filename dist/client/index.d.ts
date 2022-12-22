import Core from "../core/index.js";
import * as types from "./types.js";
export default class Client {
    private readonly ctx;
    private _guilds;
    constructor(ctx: Core);
    dispatch(payload: any, event: string): Promise<void>;
    /**
     * Get all guilds stored in the client
     * @returns List of guilds
    */
    getGuilds(): types.Guild[];
    /**
     * Get a specific guild by id
     * @param id guild id
     * @returns Guild object
    */
    getGuild(id: string): types.Guild | undefined;
    /**
     * Get all channels in a guild
     * @param id guild id
     * @returns List of channels
    */
    getGuildChannels(id: string): types.Channel[] | undefined;
    /**
     * Get a specific channel by id
     * @param id channel id
     * @returns Channel object
    */
    getGuildChannel(id: string): types.Channel | undefined;
    /**
     * Get all roles in a guild
     * @param id guild id
     * @returns List of roles
    */
    getGuildRoles(id: string): types.Role[] | undefined;
    /**
     * Get a specific role by id
     * @param id role id
     * @returns Role object
    */
    getGuildRole(id: string): types.Role | undefined;
    /**
     * Get all emojis in a guild
     * @param id guild id
     * @returns List of emojis
    */
    getGuildEmojis(id: string): types.Emoji[] | undefined;
    /**
     * Get a specific emoji by id
     * @param id emoji id
     * @returns Emoji object
    */
    getGuildEmoji(id: string): types.Emoji | undefined;
}
