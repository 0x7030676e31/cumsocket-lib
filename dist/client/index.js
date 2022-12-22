export default class Client {
    ctx;
    _guilds = [];
    constructor(ctx) {
        this.ctx = ctx;
    }
    // Dispatches events from the gateway
    async dispatch(payload, event) {
        switch (event) {
            case "READY":
                this._guilds = payload.guilds;
                break;
            case "GUILD_ROLE_CREATE":
                break;
            case "GUILD_ROLE_DELETE":
                break;
            case "GUILD_ROLE_UPDATE":
                break;
            case "GUILD_SCHEDULED_EVENT_USER_ADD":
                break;
            case "GUILD_UPDATE":
                break;
        }
    }
    /**
     * Get all guilds stored in the client
     * @returns List of guilds
    */
    getGuilds() {
        return structuredClone(this._guilds);
    }
    /**
     * Get a specific guild by id
     * @param id guild id
     * @returns Guild object
    */
    getGuild(id) {
        return structuredClone(this._guilds.find((guild) => guild.id === id));
    }
    /**
     * Get all channels in a guild
     * @param id guild id
     * @returns List of channels
    */
    getGuildChannels(id) {
        const guild = this.getGuild(id);
        if (!guild)
            return undefined;
        return structuredClone(guild.channels);
    }
    /**
     * Get a specific channel by id
     * @param id channel id
     * @returns Channel object
    */
    getGuildChannel(id) {
        for (const guild of this._guilds)
            for (const channel of guild.channels) {
                if (channel.id === id)
                    return structuredClone(channel);
            }
        return undefined;
    }
    /**
     * Get all roles in a guild
     * @param id guild id
     * @returns List of roles
    */
    getGuildRoles(id) {
        const guild = this.getGuild(id);
        if (!guild)
            return undefined;
        return structuredClone(guild.roles);
    }
    /**
     * Get a specific role by id
     * @param id role id
     * @returns Role object
    */
    getGuildRole(id) {
        for (const guild of this._guilds)
            for (const role of guild.roles) {
                if (role.id === id)
                    return structuredClone(role);
            }
        return undefined;
    }
    /**
     * Get all emojis in a guild
     * @param id guild id
     * @returns List of emojis
    */
    getGuildEmojis(id) {
        const guild = this.getGuild(id);
        if (!guild)
            return undefined;
        return structuredClone(guild.emojis);
    }
    /**
     * Get a specific emoji by id
     * @param id emoji id
     * @returns Emoji object
    */
    getGuildEmoji(id) {
        for (const guild of this._guilds)
            for (const emoji of guild.emojis) {
                if (emoji.id === id)
                    return structuredClone(emoji);
            }
        return undefined;
    }
}
//# sourceMappingURL=index.js.map