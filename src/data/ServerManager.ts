import { AnnouncementsConfig, AssignedProject, ServerConfig } from "@prisma/client";
import { Snowflake } from "discord.js";
import { dbclient } from "./dataHandler";

export default class ServerManager {

    serverConfig: ServerConfig;
    projects: Promise<AssignedProject[]>;
    announcementsConfig: Promise<AnnouncementsConfig[]>;

    constructor(config: ServerConfig, fromScratch = false) {
        this.serverConfig = config;
        
        if (!fromScratch) {
            this.projects = dbclient.assignedProject.findMany({
                where: {
                    serverId: config.id
                }
            });
            this.announcementsConfig = dbclient.announcementsConfig.findMany({
                where: {
                    serverId: config.id
                }
            });
        }
        else {
            this.projects = Promise.resolve([]);
            this.announcementsConfig = Promise.resolve([]);
        }
    }

    async remove(): Promise<void> {
        await dbclient.serverConfig.delete({
            where: {
                id: this.serverConfig.id
            }
        });
    }

    static async ofServer(id: Snowflake): Promise<ServerManager> {
        const server = await dbclient.serverConfig.findUnique({
            where: {
                id: id
            }
        });

        return new ServerManager(server);
    }

    static fromScratch(id: Snowflake, name: string): ServerManager {
        dbclient.serverConfig.create({
            data: {
                id: id,
                serverName: name
            }
        });

        return new ServerManager({id: id, serverName: name}, true);
    }
}