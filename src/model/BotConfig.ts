import { Snowflake } from "discord.js";

export interface BotConfig {
    prefix: string;
    token: string;
    serverConfig: {[serverId: string]: ServerConfig};
}

export interface ServerConfig {
    releasesChannel: Snowflake;
    messageTemplate: string;
    projects: Array<CachedProject>;
}

export interface CachedProject {
    id: number;
    version: string;
}