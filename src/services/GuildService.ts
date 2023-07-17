import {Snowflake} from "discord.js";
import {dbclient, DBHelper} from "../data/dataHandler";
import CacheService from "./CacheService";

export default class GuildService {

    static async getAllServerConfigs() {
        return await dbclient.serverConfig.findMany({
            include: {
                announcementConfigs: true
            }
        });
    }

    static removeServer(id: Snowflake): void {
        dbclient.serverConfig.delete({
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
        dbclient.serverConfig.create({
            data: {
                id: server.id,
                serverName: server.name
            }
        })
    }

    // ---- Project Schedule ----
    static async getAllProjects(serverId: Snowflake) {
        return await dbclient.serverConfig.findUniqueOrThrow({
            where: { id: serverId },
            select: {
                serverName: true,
                projects: true
            }
        });
    }

    static async addProject(serverId: Snowflake, projectId: number) {

        const serverConfig = await dbclient.serverConfig.findUniqueOrThrow({
            where: {id: serverId},
            select: {
                projects: {
                    select: {
                        id: true,
                    }
                }
            }
        });

        if (serverConfig.projects.length >= 30)
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

    static async clearProjects(serverId: Snowflake) {
        const projNumbers = await dbclient.serverConfig.findUnique({
            where: { id: serverId },
            select: {
                projects: { select: { id: true } }
            }
        });

        if (!projNumbers || projNumbers.projects.length === 0) {
            throw Error("Schedule is already empty!")
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

        if (projNumbers) {
            for (const idObj of projNumbers.projects) {
                await CacheService.cleanupProject(idObj.id, serverId);
            }

            await DBHelper.runTransaction(serverId)
        }
    }
}