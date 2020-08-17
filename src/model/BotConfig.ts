import { Snowflake } from "discord.js";

export interface BotConfig {
    prefix: string,
    token: string,
    serverConfig: Map<Snowflake, ServerConfig>
}

export interface ServerConfig {
    releasesChannel: Snowflake,
    messageTemplate: string,
    projects: Array<CachedProject>
}

export interface CachedProject {
    id: number,
    version: string
}