import {Snowflake} from "discord.js";
import {dbclient} from "../data/dataHandler.js";
import GameTag from "../model/GameTag.js";

export default class UpdatesService {

    private static updateConfigs = dbclient.announcementsConfig;

    static async getAllServerUpdateConfigs(serverId: Snowflake) {
        return await this.updateConfigs.findMany({
            where: {
                serverId: serverId
            }
        })
    }

    static async getAllConfigIds(serverId: Snowflake) {
        return await this.updateConfigs.findMany({
            where: {
                serverId: serverId
            },
            select: {
                id: true
            }
        })
    }

    static async addReportTemplate(serverId: Snowflake, channel: string | undefined, message: string | undefined) {
        return await this.updateConfigs.create({data: {
            serverId: serverId,
            channel: channel,
            message: message
        }});
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
        const filters = (
            await this.updateConfigs.findUniqueOrThrow({
                where: { id: id },
                select: {
                    tagsFilter: true,
                    projectsFilter: true
                }
            })
        );

        const tags = filters.tagsFilter ? filters.tagsFilter.split('|').map(stag => GameTag.fromString(stag)) : [];
        const projects = filters.projectsFilter ? filters.projectsFilter.split('|').map(sProject => Number(sProject)) : [];
        return { tags: tags, projects: projects }
    }

    static async setProjectsFilter(id: number, projectIds: number[]) {
        await this.updateConfigs.update({
            where: { id: id },
            data: { projectsFilter: projectIds.join('|') }
        })
    }

}