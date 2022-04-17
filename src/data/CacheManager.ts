import { CachedProject } from "@prisma/client";
import { Snowflake } from "discord.js";
import { dbclient } from "./dataHandler";

export default class CacheManager {

    static async getAllProjects(): Promise<CachedProject[]> {
        return await dbclient.cachedProject.findMany();
    }

    static async getCachedProject(idOrSlug: number | string): Promise<CachedProject> {
        return await dbclient.cachedProject.findUnique({
            where: {
                id: typeof idOrSlug === 'number' ? idOrSlug : undefined,
                slug: typeof idOrSlug === 'string' ? idOrSlug : undefined,
            }
        })
    }

    static async editProjectVersion(idOrSlug: number | string, newVersion: string): Promise<void> {
        await dbclient.cachedProject.update({
            where: {
                id: typeof idOrSlug === 'number' ? idOrSlug : undefined,
                slug: typeof idOrSlug === 'string' ? idOrSlug : undefined,
            },
            data: {
                version: newVersion,
            }
        })
    }

    static async addProject(guildId: Snowflake, id: number, slug: string, latestVersion: string): Promise<void> {
        await dbclient.cachedProject.upsert({
            where: {
                id: id,
                slug: slug
            },
            update: {},
            create: {
                id: id,
                slug: slug,
                version: latestVersion,
                subscribedGuilds: {
                    connectOrCreate: {
                        where: {
                            projectId_serverId: {
                                projectId: id,
                                serverId: guildId
                            }
                        },
                        create: {
                            serverId: guildId
                        }
                    }
                }
            }
        })
    }

    static async cleanupProject(id: number) {
        const matches = await dbclient.assignedProject.findMany({
            where: {
                projectId: id
            }
        });

        if (matches.length === 0) {
            await this.removeProject(id);
        }
    }

    static async removeProject(idOrSlug: number | string) {
        await dbclient.cachedProject.delete({
            where: {
                id: typeof idOrSlug === 'number' ? idOrSlug : undefined,
                slug: typeof idOrSlug === 'string' ? idOrSlug : undefined,
            }
        });
    }
}