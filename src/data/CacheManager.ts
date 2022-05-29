import { CachedProject } from "@prisma/client";
import { Snowflake } from "discord.js";
import { dbclient, DBHelper } from "./dataHandler";

export default class CacheManager {

    static async getAllProjects(): Promise<CachedProject[]> {
        return await dbclient.cachedProject.findMany();
    }

    static async getCachedProject(idOrSlug: number | string): Promise<CachedProject | null> {
        return await dbclient.cachedProject.findUnique({
            where: {
                id: typeof idOrSlug === 'number' ? idOrSlug : undefined,
                slug: typeof idOrSlug === 'string' ? idOrSlug : undefined,
            }
        });
    }

    static editProjectVersion(transactionId: string, idOrSlug: number | string, newVersion: string): void {
        DBHelper.enqueueInTransaction(transactionId, 
            dbclient.cachedProject.update({
                where: {
                    id: typeof idOrSlug === 'number' ? idOrSlug : undefined,
                    slug: typeof idOrSlug === 'string' ? idOrSlug : undefined,
                },
                data: {
                    version: newVersion,
                }
            })
        );
    }

    static addProject(guildId: Snowflake, id: number, slug: string, latestVersion: string): void {
        DBHelper.enqueueInTransaction(guildId, 
            dbclient.cachedProject.upsert({
                where: {
                    id: id,
                    slug: !id ? slug : undefined
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
        );
    }

    static async cleanupProject(transactionId: string, id: number) {
        const matches = await dbclient.assignedProject.findMany({
            where: {
                projectId: id
            }
        });

        if (matches.length === 0) {
            await this.removeProject(transactionId, id);
        }
    }

    static async removeProject(transactionId: string, idOrSlug: number | string) {
        DBHelper.enqueueInTransaction(transactionId, 
            dbclient.cachedProject.delete({
                where: {
                    id: typeof idOrSlug === 'number' ? idOrSlug : undefined,
                    slug: typeof idOrSlug === 'string' ? idOrSlug : undefined,
                }
            })
        );
    }
}