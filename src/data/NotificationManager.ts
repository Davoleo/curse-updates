import { AnnouncementsConfig } from "@prisma/client";
import { Snowflake } from "discord.js";
import { dbclient } from "./dataHandler";

export default class NotificationManager {

    private constructor(public serverId: Snowflake, public announcementsConfig: AnnouncementsConfig[]) {}

    static async ofServer(id: Snowflake): Promise<NotificationManager> {
        const configs = await dbclient.announcementsConfig.findMany({
            where: {
                serverId: id,
            },
            orderBy: {
                id: 'asc'
            }
        });

        return new NotificationManager(id, configs)
    }

    async save() {
        // Update Announcement Templates
        for (const i of this.announcementsConfig.keys()) {
            if (this.announcementsConfig[i] === null) {
                //Remove Annoucement Template
                await dbclient.announcementsConfig.delete({
                    where: {
                        id_serverId: {
                            id: i,
                            serverId: this.serverId
                        }
                    }
                });
            }
            else {
                const newChannel = this.announcementsConfig[i].channel;
                const newMessage = this.announcementsConfig[i].message;
                const newFilter = this.announcementsConfig[i].gameVerFilter;
                await dbclient.announcementsConfig.upsert({
                    where: {
                        id_serverId: {
                            id: i,
                            serverId: this.serverId
                        }
                    },
                    update: {
                        channel: newChannel,
                        message: newMessage,
                    },
                    create: {
                        id: i,
                        serverId: this.serverId,
                        channel: newChannel,
                        message: newMessage,
                        gameVerFilter: newFilter
                    }
                })
            }
        }
    }
    
    addReportTemplate(channel: Snowflake = undefined, message: string = undefined, gameVerFilter: string = undefined): void {
        //id is -1 because it's just a temporary number to allow adding this object to the inner field
        this.announcementsConfig.push({
            id: this.announcementsConfig.length,
            serverId: this.serverId,
            channel: channel,
            message: message,
            gameVerFilter: gameVerFilter
        });
    }

    removeReportTemplate(tid: number): void {
        if (tid < 0 || tid >= this.announcementsConfig.length)
            throw Error("That Announcement Template doesn't exist!");

        this.announcementsConfig[tid] = null;
    }

    editReportChannel(tid: number, channel: Snowflake = null): void {
        if (tid < 0 || tid >= this.announcementsConfig.length)
            throw Error("That Announcement Template doesn't exist!");
        
        this.announcementsConfig[tid].channel = channel;
    }

    editReportMessage(tid: number, message: string = null): void {
        if (tid < 0 || tid >= this.announcementsConfig.length)
            throw Error("That Announcement Template doesn't exist!");

        this.announcementsConfig[tid].message = message;
    }

    setGameVersionFilter(tid: number, gameVersions: string[]): void {
        if (tid < 0 || tid >= this.announcementsConfig.length)
            throw Error("That Announcement Template doesn't exist!");

        this.announcementsConfig[tid].gameVerFilter = gameVersions.join('|');
    }

    getGameVersionFilter(tid: number): string[] {
        if (tid < 0 || tid >= this.announcementsConfig.length)
            throw Error("That Announcement Template doesn't exist!");

        return this.announcementsConfig[tid].gameVerFilter.split('|');
    }

}