import { Snowflake } from "discord.js";
import { CachedProject, ServerConfig } from "../model/BotConfig";

const storage = new Loki("data.db");
const serverCollection = storage.addCollection('server_config');
const cachedProjects = storage.addCollection('cached_projects');

function initServerConfig(serverId: Snowflake): void {
    const oldServer = serverCollection.findOne({serverId: serverId});

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
    const server = serverCollection.findOne({serverId: serverId});

    if (server !== null) {
        serverCollection.remove(server);
        return true;
    }
    else return false;
}

//#region Projects Cache

function addProjectToCache(newProject: CachedProject, update: boolean): void {
    
    const project: CachedProject = getProjectById(newProject.id)

    if (project === null) {
        cachedProjects.insert({
            id: newProject.id,
            slug: newProject.slug,
            version: newProject.version
        });
    }
    else if (update) {
        if (project.version !== newProject.version) {
            updateCachedProject(project.id, newProject.version);
        }
    }
}

function getProjectById(id: number): CachedProject {
    const project: CachedProject = cachedProjects.findOne({id: id});
    return project;
}

function updateCachedProject(id: number, newVersion: string): void {
    const project: CachedProject = cachedProjects.findOne({id: id});
    project.version = newVersion;
    cachedProjects.update(project);
}

//#endregion Projects Cache

//#region ServerConfig

function getPrefix(serverId: Snowflake): string {
    const server: ServerConfig = serverCollection.findOne({serverId: serverId});
    return server.prefix;
}

function updatePrefix(serverId: Snowflake, prefix: string): void {
    const server: ServerConfig = serverCollection.findOne({serverId: serverId});
    server.prefix = prefix;
    serverCollection.update(server);
}

function addProjectToSchedule(serverId: Snowflake, projectId: number): void {
    const server: ServerConfig = serverCollection.findOne({serverId: serverId})
    server.projectIds.push(projectId);
    serverCollection.update(server);
}

function removeProjectFromSchedule(serverId: Snowflake, projectId: number): boolean {
    const server: ServerConfig = serverCollection.findOne({serverId: serverId});
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
    const server: ServerConfig = serverCollection.findOne({serverId: serverId});
    server.projectIds = [];
    serverCollection.update(server)
}

function setReleseChannel(serverId: Snowflake, channelId: Snowflake): void {
    const server: ServerConfig = serverCollection.findOne({serverId: serverId});
    server.releasesChannel = channelId;
    serverCollection.update(server);
}

function resetReleaseChannel(serverId: Snowflake): void {
    const server: ServerConfig = serverCollection.findOne({serverId: serverId});
    server.releasesChannel = '-1';
    serverCollection.update(server);
}

function setTemplateMessage(serverId: Snowflake, message: string): void {
    const server: ServerConfig = serverCollection.findOne({serverId: serverId});
    server.messageTemplate = message;
    serverCollection.update(server);
}

//#endregion Server Config

export const guildInitializer = {
    initServerConfig,
    removeServerConfig
}

export const cacheHandler = {
    addProjectToCache,
    getProjectById,
    updateCachedProject
}

export const guildHandler = {
    getPrefix,
    updatePrefix,
    addProjectToSchedule,
    removeProjectFromSchedule,
    clearProjectsSchedule,
    setReleseChannel,
    resetReleaseChannel,
    setTemplateMessage
}