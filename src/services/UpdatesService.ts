import {Snowflake} from "discord.js";
import {dbclient} from "../data/dataHandler.js";
import GameTag from "../model/GameTag.js";

export default class UpdatesService {

    private static updateConfigs = dbclient.announcementsConfig;

    static getAllServerUpdateConfigs(serverId: Snowflake) {
        return this.updateConfigs.findMany({
            where: {
                serverId: serverId
            }
        });
    }

    static getAllConfigIds(serverId: Snowflake) {
        return this.updateConfigs.findMany({
            where: {
                serverId: serverId
            },
            select: {
                id: true
            }
        });
    }

    static async addReportTemplate(serverId: Snowflake, serverName: string, channel: string | undefined, message: string | undefined)  {
        return this.updateConfigs.create({
            data: {
                server: {
                    connectOrCreate: {
                        where: {
                            id: serverId
                        },
                        create: {
                            id: serverId,
                            serverName: serverName
                        }
                    }
                },
                channel: channel,
                message: message
            }
        });
    }

    static async removeReportTemplate(id: number) {
        await this.updateConfigs.delete({where: {
            id: id
        }});
    }

    /**
     * Changes the updates channel to another unique reference
     * @param id of the update config [incremental & autogenerated]
     * @param channel discord snowflake
     */
    static async editReportChannel(id: number, channel: Snowflake | undefined) {
        await this.updateConfigs.update({
            where: { id: id },
            data: { channel: channel }
        })
    }

    static async editReportMessage(id: number, message: string | undefined) {
        await this.updateConfigs.update({
            where: { id: id },
            data: { message: message }
        })
    }

    static async setTagsFilter(id: number, tags: GameTag[] | undefined) {
        await this.updateConfigs.update({
            where: { id: id },
            data: { tagsFilter: tags?.map(tag => tag.join()).join('|') }
        })
    }

    static async getFilters(id: number): Promise<{ tags: GameTag[], projects: number[] }> {
        const unparsedFilters = await this.getFilterStrings(id);

        const tags = unparsedFilters.tags ? unparsedFilters.tags.split('|').map(stag => GameTag.fromString(stag)) : [];
        const projects = unparsedFilters.projects ? unparsedFilters.projects.split('|').map(sProject => Number(sProject)) : [];
        return { tags: tags, projects: projects }
    }

    static async getFilterStrings(id: number): Promise<{tags: string|null, projects: string|null}> {
        const filters = (
            await this.updateConfigs.findUniqueOrThrow({
                where: { id: id },
                select: {
                    tagsFilter: true,
                    projectsFilter: true
                }
            })
        );

        return { tags: filters.tagsFilter, projects: filters.projectsFilter }
    }

    static async setProjectsFilter(id: number, projectIds: number[]) {
        await this.updateConfigs.update({
            where: { id: id },
            data: { projectsFilter: projectIds.join('|') }
        })
    }

}