import {Snowflake} from "discord.js";
import {dbclient, DBHelper} from "../data/dataHandler.js";
import CacheService from "./CacheService.js";
import UninitializedGuildError from "../model/UninitializedGuildError.js";
import BotConfig from "../util/BotConfig.js";

export default class GuildService {

    static async getAllServerConfigs() {
        return dbclient.serverConfig.findMany({
            include: {
                projects: {
                    select: {
                        id: true
                    }
                },
                announcementConfigs: true
            }
        });
    }

    static async removeServer(id: Snowflake) {
        return dbclient.serverConfig.delete({
            where: {
                id: id
            }
        });
    }

    static async getUpdateSettings(id: Snowflake) {
        return (
            await dbclient.serverConfig.findUniqueOrThrow({
                where: {
                    id: id
                },
                select: {
                    announcementConfigs: true
                }
            })
        ).announcementConfigs;
    }

    /**
     * initializes new entry in the Guilds table;
     * if already initialized the guild name is updated
     * @param server serverId and name from Discord
     */
    static async initServer(server: {id: Snowflake, name: string}) {
        return dbclient.serverConfig.create({
            data: {
                id: server.id,
                serverName: server.name
            },
            include: {
                projects: true,
            }
        })
    }

    // ---- Project Schedule ----
    static async getAllProjects(serverId: Snowflake) {
        const projects = await dbclient.serverConfig.findUnique({
            where: { id: serverId },
            select: {
                serverName: true,
                projects: true
            }
        });

        if (!projects)
            throw new UninitializedGuildError(serverId);

        return projects;
    }

    static async addProject(serverId: Snowflake, serverName: string, projectId: number) {

        let serverConfig = await dbclient.serverConfig.findUnique({
            where: {id: serverId},
            select: {
                projects: {
                    select: {
                        id: true,
                    }
                }
            }
        });

        if (!serverConfig)
            serverConfig = await this.initServer({id: serverId, name: serverName})

        const botConfig = BotConfig.get()
        if (botConfig.ServerProjectsLimit !== -1 && serverConfig.projects.length > botConfig.ServerProjectsLimit)
            throw Error("Too many Assigned projects! Remove something first.");

        if (serverConfig.projects.indexOf({ id: projectId }) !== -1)
            throw Error("Project already Scheduled!");

        return await CacheService.addProject(serverId, projectId)
    }

    static async removeProject(serverId: Snowflake, projectId: number) {
        await dbclient.serverConfig.update({
            where: { id: serverId },
            select: { projects: {
                select: { id: true }
            }},
            data: {
                projects: {
                    disconnect: {
                        id: projectId
                    }
                }
            }
        })

        await CacheService.cleanupProject(projectId, null)
    }

    static async clearProjects(serverId: Snowflake, cleanUpCache = true) {
        const projNumbers = await dbclient.serverConfig.findUnique({
            where: { id: serverId },
            select: {
                projects: { select: { id: true } }
            }
        });

        if (!projNumbers)
            throw new UninitializedGuildError(serverId);

        if (projNumbers.projects.length === 0) {
            return;
        }

        await dbclient.serverConfig.update({
            where: { id: serverId },
            include: { projects: true },
            data: {
                projects: {
                    set: [],
                }
            }
        })

        if (cleanUpCache && projNumbers.projects.length > 0) {
            for (const idObj of projNumbers.projects) {
                await CacheService.cleanupProject(idObj.id, serverId);
            }

            await DBHelper.runTransaction(serverId)
        }
    }
}