import { Snowflake } from "discord.js";
import { CachedProject, ServerConfig } from "../model/BotConfig";
import * as Loki from 'lokijs'

const storage = new Loki("data.db", {
    autoload: true,
    autoloadCallback: databaseInit,
    autosave: true,
    autosaveInterval: 8000
});

let serverCollection: Collection<ServerConfig>;
let cachedProjects: Collection<CachedProject>;

function databaseInit() {
    serverCollection = storage.getCollection("server_config");
    if (serverCollection === null)
        storage.addCollection('server_config');

    cachedProjects = storage.getCollection("cached_projects");
    if (cachedProjects === null)
        storage.addCollection('cached_projects');
}

function initServerConfig(serverId: Snowflake, serverName: string): void {
    const oldServer = serverCollection.findOne({'serverId': serverId});

    if (oldServer == null) {
        serverCollection.insert({
            serverId: serverId,
            serverName: serverName,
            prefix: '||',
            releasesChannel: '-1',
            messageTemplate: '',
            projectIds: []
        });
    }
}

function removeServerConfig(serverId: Snowflake): boolean {
    const server = serverCollection.find({'serverId': serverId});

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
    const project: CachedProject = cachedProjects.findOne({'id': projectID});

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
    const project: CachedProject = cachedProjects.findOne({'id': id});
    return project;
}

function getAllCachedProjects(): CachedProject[] {
    return cachedProjects.find({});
}

function updateCachedProject(id: number, newVersion: string): void {
    const project: CachedProject = cachedProjects.findOne({'id': id});
    project.version = newVersion;
    cachedProjects.update(project);
}

//#endregion Projects Cache

//#region ServerConfig

function getAllServerConfigs(): ServerConfig[] {
    return serverCollection.find({});
}

function getServerConfig(serverId: Snowflake): ServerConfig {
    return serverCollection.findOne({'serverId': serverId});
}

function updatePrefix(serverId: Snowflake, prefix: string): void {
    const server: ServerConfig = getServerConfig(serverId);
    server.prefix = prefix;
    serverCollection.update(server);
}

function addProjectToSchedule(serverId: Snowflake, projectId: number): void {
    const server: ServerConfig = getServerConfig(serverId);
    if (server.projectIds.length > 30)
        throw Error("Too_Many_Projects")
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
    getAllCachedProjects,
    removeProjectById
}

export const GuildHandler = {
    updatePrefix,
    addProjectToSchedule,
    removeProjectFromSchedule,
    clearProjectsSchedule,
    setReleseChannel,
    resetReleaseChannel,
    setTemplateMessage,
    getServerConfig,
    getAllServerConfigs
}