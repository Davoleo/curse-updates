import { AnnouncementsConfig } from "@prisma/client";
import { Snowflake } from "discord.js";
import { dbclient } from "./dataHandler";

//TODO add projectFilter to Prisma Schema
export default class UpdatesManager {

    private constructor(public serverId: Snowflake, public announcementsConfig: Array<AnnouncementsConfig | null>) {}

    static async ofServer(id: Snowflake): Promise<UpdatesManager> {
        const configs = await dbclient.announcementsConfig.findMany({
            where: {
                serverId: id,
            },
            orderBy: {
                id: 'asc'
            }
        });

        return new UpdatesManager(id, configs)
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
                const newChannel = this.announcementsConfig[i]!.channel;
                const newMessage = this.announcementsConfig[i]!.message;
                const newFilter = this.announcementsConfig[i]!.gameVerFilter;
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

    private isTemplateInvalid(tid: number) {
        return tid < 0 || tid >= this.announcementsConfig.length || this.announcementsConfig[tid] === null;
    }
    
    addReportTemplate(channel: Snowflake | undefined = undefined, message: string | undefined = undefined, gameVerFilter: string | undefined = undefined): void {
        //id is -1 because it's just a temporary number to allow adding this object to the inner field
        this.announcementsConfig.push({
            id: this.announcementsConfig.length,
            serverId: this.serverId,
            channel: channel ?? null,
            message: message ?? null,
            gameVerFilter: gameVerFilter ?? null
        });
    }

    removeReportTemplate(tid: number): void {
        if (this.isTemplateInvalid(tid))
            throw Error("That Announcement Template doesn't exist!");

        this.announcementsConfig[tid] = null;
    }

    editReportChannel(tid: number, channel: Snowflake | undefined): void {
        if (this.isTemplateInvalid(tid))
            throw Error("That Announcement Template doesn't exist!");
        
        this.announcementsConfig[tid]!.channel = channel ?? null;
    }

    editReportMessage(tid: number, message: string | undefined): void {
        if (this.isTemplateInvalid(tid))
            throw Error("That Announcement Template doesn't exist!");

        this.announcementsConfig[tid]!.message = message ?? null;
    }

    setGameVersionFilter(tid: number, gameVersions: string[]): void {
        if (this.isTemplateInvalid(tid))
            throw Error("That Announcement Template doesn't exist!");

        this.announcementsConfig[tid]!.gameVerFilter = gameVersions.join('|');
    }

    getGameVersionFilter(tid: number): string[] | null {
        if (this.isTemplateInvalid(tid))
            throw Error("That Announcement Template doesn't exist!");

        const gameVersString = this.announcementsConfig[tid]!.gameVerFilter;
        return gameVersString !== null ? gameVersString.split('|') : null;
    }

}