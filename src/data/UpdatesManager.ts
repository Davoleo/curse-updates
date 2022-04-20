import { AnnouncementsConfig } from "@prisma/client";
import * as assert from "assert";
import { Snowflake } from "discord.js";
import { dbclient } from "./dataHandler";

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
                const newGamesFilter = this.announcementsConfig[i]!.gameVerFilter;
                const newProjectsFilter = this.announcementsConfig[i]!.projectsFilter;
                await dbclient.announcementsConfig.upsert({
                    where: {
                        id_serverId: {
                            id: i,
                            serverId: this.serverId
                        }
                    },
                    create: {
                        id: i,
                        serverId: this.serverId,
                        channel: newChannel,
                        message: newMessage,
                    },
                    update: {
                        channel: newChannel,
                        message: newMessage,
                        gameVerFilter: newGamesFilter,
                        projectsFilter: newProjectsFilter
                    }
                })
            }
        }
    }

    isTemplateInvalid(tid: number) {
        return tid < 0 || tid >= this.announcementsConfig.length || this.announcementsConfig[tid] === null;
    }
    
    addReportTemplate(channel: Snowflake | undefined = undefined, message: string | undefined = undefined): void {
        //id is -1 because it's just a temporary number to allow adding this object to the inner field
        this.announcementsConfig.push({
            id: this.announcementsConfig.length,
            serverId: this.serverId,
            channel: channel ?? null,
            message: message ?? null,
            gameVerFilter: null,
            projectsFilter: null
        });
    }

    removeReportTemplate(tid: number): void {
        assert(!this.isTemplateInvalid(tid));
        this.announcementsConfig[tid] = null;
    }

    editReportChannel(tid: number, channel: Snowflake | undefined): void {
        assert(!this.isTemplateInvalid(tid));
        this.announcementsConfig[tid]!.channel = channel ?? null;
    }

    editReportMessage(tid: number, message: string | undefined): void {
        assert(!this.isTemplateInvalid(tid));
        this.announcementsConfig[tid]!.message = message ?? null;
    }

    setGameVersionFilter(tid: number, gameVersions: string[] | undefined): void {
        assert(!this.isTemplateInvalid(tid));
        this.announcementsConfig[tid]!.gameVerFilter = gameVersions !== undefined ? gameVersions.join('|') : null;
    }

    getGameVersionFilter(tid: number): string[] | undefined {
        assert(!this.isTemplateInvalid(tid));
        const gameVersString = this.announcementsConfig[tid]!.gameVerFilter;
        
        return gameVersString !== null ? gameVersString.split('|') : undefined;
    }

    setProjectsFilter(tid: number, slugs: string[] | undefined): void {
        assert(!this.isTemplateInvalid(tid));
        this.announcementsConfig[tid]!.projectsFilter = slugs !== undefined ? slugs.join('|') : null;
    }

    getProjectsFilter(tid: number): string[] | undefined {
        assert(!this.isTemplateInvalid(tid));

        const slugString = this.announcementsConfig[tid]!.projectsFilter;
        return slugString !== null ? slugString.split('|') : undefined;
    }

}