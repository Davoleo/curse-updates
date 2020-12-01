import { Snowflake } from "discord.js";
import { CachedProject, ServerConfig } from "../model/BotConfig";

const storage = new Loki("data.db");
const serverCollection = storage.addCollection('server_config');
const cachedProjects = storage.addCollection('cached_projects');

function initServerConfig(serverId: Snowflake): void {
    const oldServer = serverCollection.findObject({serverId: serverId});

    if (oldServer === null) {
        serverCollection.insert({
            serverId: serverId,
            prefix: '||',
            releasesChannel: '-1',
            messageTemplate: '',
            projectIds: []
        });
    }
}

function removeServerConfig(serverId: Snowflake): boolean {
    const server = serverCollection.findObject({serverId: serverId});

    if (server !== null) {
        serverCollection.remove(server);
        return true;
    }
    else return false;
}

//#region Projects Cache

function addProjectToCache(id: number, slug: string, version: string, guildId: Snowflake, update: boolean): void {
    
    const project: CachedProject = getProjectById(id)

    if (project === null) {
        cachedProjects.insert({
            id: id,
            slug: slug,
            version: version,
            subbedGuilds: [guildId]
        });
    }
    else if (update) {
        if (project.version !== version) {
            updateCachedProject(project.id, version);
        }

        if (project.subbedGuilds.indexOf(guildId) === -1) {
            project.subbedGuilds.push(guildId);
        }
    }
}

function removeAllByGuild(guildId: Snowflake, projectIds: number[]): void {
    projectIds.forEach(id => removeProjectById(guildId, id))
}

function removeProjectById(guildId: Snowflake, projectID: number): void {
    const project: CachedProject = cachedProjects.findObject({id: projectID});

    if (project.subbedGuilds.length <= 1) {
        cachedProjects.findAndRemove({ id: { '$eq': project.id }});
    }
    else {
        cachedProjects.findAndUpdate({id: { '$eq': project.id }}, (project: CachedProject) => {
            const indexOfProject = project.subbedGuilds.indexOf(guildId);
            project.subbedGuilds.splice(indexOfProject, 1);
        })
    }
}

function getProjectById(id: number): CachedProject {
    const project: CachedProject = cachedProjects.findObject({id: id});
    return project;
}

function getAllCachedProjects(): CachedProject[] {
    return cachedProjects.find({});
}

function updateCachedProject(id: number, newVersion: string): void {
    const project: CachedProject = cachedProjects.findObject({id: id});
    project.version = newVersion;
    cachedProjects.update(project);
}

//#endregion Projects Cache

//#region ServerConfig

function getServerConfig(serverId: Snowflake): ServerConfig {
    return serverCollection.findObject({serverId: serverId});
}

function updatePrefix(serverId: Snowflake, prefix: string): void {
    const server: ServerConfig = getServerConfig(serverId);
    server.prefix = prefix;
    serverCollection.update(server);
}

function addProjectToSchedule(serverId: Snowflake, projectId: number): void {
    const server: ServerConfig = getServerConfig(serverId);
    server.projectIds.push(projectId);
    serverCollection.update(server);
}

function removeProjectFromSchedule(serverId: Snowflake, projectId: number): boolean {
    const server: ServerConfig = getServerConfig(serverId);
    let found = false;
    
    server.projectIds.forEach(id => {
        if (id === projectId) {
            found = true;
            const indexOfProject = server.projectIds.indexOf(id);
            server.projectIds.splice(indexOfProject, 1);
            serverCollection.update(server);
        }
    })

    return found;
}

function clearProjectsSchedule(serverId: Snowflake): void {
    const server: ServerConfig = getServerConfig(serverId);
    server.projectIds = [];
    serverCollection.update(server)
}

function setReleseChannel(serverId: Snowflake, channelId: Snowflake): void {
    const server: ServerConfig = getServerConfig(serverId);
    server.releasesChannel = channelId;
    serverCollection.update(server);
}

function resetReleaseChannel(serverId: Snowflake): void {
    const server: ServerConfig = getServerConfig(serverId);
    server.releasesChannel = '-1';
    serverCollection.update(server);
}

function setTemplateMessage(serverId: Snowflake, message: string): void {
    const server: ServerConfig = getServerConfig(serverId);
    server.messageTemplate = message;
    serverCollection.update(server);
}

//#endregion Server Config

export const GuildInitializer = {
    initServerConfig,
    removeServerConfig
}

export const CacheHandler = {
    addProjectToCache,
    getProjectById,
    updateCachedProject,
    removeAllByGuild,
    getAllCachedProjects
}

export const GuildHandler = {
    updatePrefix,
    addProjectToSchedule,
    removeProjectFromSchedule,
    clearProjectsSchedule,
    setReleseChannel,
    resetReleaseChannel,
    setTemplateMessage,
    getServerConfig
}