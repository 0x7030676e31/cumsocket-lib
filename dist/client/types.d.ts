export interface Guild {
    version: number;
    threads: Thread[];
    stage_instances: StageInstance[];
    roles: Role[];
    properties: GuildProperties;
    premium_subscription_count: number;
    member_count: number;
    lazy: boolean;
    large: boolean;
    joined_at: string;
    id: string;
    guild_scheduled_events: GuildScheduledEvent[];
    emojis: Emoji[];
    data_mode: string;
    channels: Channel[];
    application_command_counts: ApplicationCommandCounts;
}
export interface ApplicationCommandCounts {
    1?: number;
    2?: number;
    3?: number;
}
export interface Emoji {
    roles: string[];
    require_colons: boolean;
    name: string;
    managed: boolean;
    id: string;
    available: boolean;
    animated: boolean;
}
export interface GuildScheduledEvent {
    status: number;
    sku_ids: [];
    scheduled_start_time: string;
    scheduled_end_time: string | null;
    privacy_level: number;
    name: string;
    image: string;
    id: string;
    guild_id: string;
    entity_type: number;
    entity_metadata: entityMetadata;
    entity_id: null;
    description: string;
    creator_id: string;
    channel_id: string | null;
}
export interface entityMetadata {
    speaker_ids?: [];
    location?: string;
}
export interface GuildProperties {
    verification_level: number;
    vanity_url_code: string | null;
    system_channel_id: string | null;
    system_channel_flags: number;
    splash: string | null;
    safety_alerts_channel_id?: null;
    rules_channel_id: string | null;
    public_updates_channel_id: string | null;
    premium_tier: number;
    premium_progress_bar_enabled: boolean;
    preferred_locale: string;
    owner_id: string;
    nsfw_level: number;
    nsfw: boolean;
    name: string;
    mfa_level: number;
    max_video_channel_users: number;
    max_stage_video_channel_users: number;
    max_members: number;
    id: string;
    icon: string | null;
    hub_type: null;
    features: string[];
    explicit_content_filter: number;
    discovery_splash: string | null;
    description: string | null;
    default_message_notifications: number;
    banner: string | null;
    application_id: null;
    afk_timeout: number;
    afk_channel_id: string | null;
}
export interface StageInstance {
}
export interface Thread {
    type: number;
    total_message_sent: number;
    thread_metadata: ThreadMetadata;
    rate_limit_per_user: number;
    parent_id: string;
    owner_id: string;
    name: string;
    message_count: number;
    member_ids_preview: string[];
    member_count: number;
    member: ThreadMember;
    last_message_id: string;
    id: string;
    guild_id: string;
    flags: number;
    applied_tags: string[];
}
export interface ThreadMetadata {
    locked: boolean;
    create_timestamp: string;
    auto_archive_duration: number;
    archived: boolean;
    archive_timestamp: string;
}
export interface ThreadMember {
    muted: boolean;
    mute_config: null;
    join_timestamp: string;
    flags: number;
}
export interface Sticker {
    type: number;
    tags: string;
    name: string;
    id: string;
    guild_id: string;
    format_type: number;
    description: string | null;
    available: boolean;
    asset?: string;
}
export interface Channel {
    type: number;
    topic?: string | null;
    rate_limit_per_user?: number;
    position: number;
    permission_overwrites: PermissionOverwrites[];
    parent_id?: string | null;
    name: string;
    last_message_id?: string | null;
    id: string;
    flags: number;
    nsfw?: boolean;
    last_pin_timestamp?: string;
    user_limit?: number;
    rtc_region?: string | null;
    bitrate?: number;
    default_auto_archive_duration?: number;
    default_thread_rate_limit_per_user?: number;
    template?: string;
    default_sort_order?: null;
    default_reaction_emoji?: DefaultReactionEmoji | null;
    default_forum_layout?: number;
    available_tags?: AvailableTags[];
    video_quality_mode?: number;
}
export interface DefaultReactionEmoji {
    emoji_name: string | null;
    emoji_id: string | null;
}
export interface PermissionOverwrites {
    type: number;
    id: string;
    deny: string;
    allow: string;
}
export interface AvailableTags {
    name: string;
    moderated: boolean;
    id: string;
    emoji_name: string | null;
    emoji_id: string | number | null;
}
export interface Role {
    unicode_emoji: string | null;
    tags: RoleTags;
    position: number;
    permissions: string;
    name: string;
    mentionable: boolean;
    managed: boolean;
    id: string;
    icon: string | null;
    hoist: boolean;
    flags: number;
    color: number;
}
export interface RoleTags {
    bot_id?: string;
    premium_subscriber?: null;
    integration_id?: string;
    subscription_listing_id?: string;
    available_for_purchase?: null;
}
