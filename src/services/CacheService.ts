import {CachedProject} from "@prisma/client";
import {dbclient, DBHelper} from "../data/dataHandler.js";
import {Snowflake} from "discord.js";
import {CurseHelper} from "../curseHelper.js";

export default class CacheManager {

    static getAllProjects(): Promise<CachedProject[]> {
        return dbclient.cachedProject.findMany();
    }

    static getCachedProject(idOrSlug: number | string): Promise<CachedProject | null> {
        return dbclient.cachedProject.findUnique({
            where: {
                id: typeof idOrSlug === 'number' ? idOrSlug : undefined,
                slug: typeof idOrSlug === 'string' ? idOrSlug : undefined,
            }
        });
    }

    static async addProject(guildId: Snowflake, id: number): Promise<string> {

        const cachedProject = await dbclient.cachedProject.findUnique({ where: { id: id } });
        if (cachedProject !== null) {
            await dbclient.cachedProject.update({
                where: {
                    id: id,
                },
                data: {
                    subscribedGuilds: {
                        connect: {
                            id: guildId
                        },
                    }
                }
            })
            return cachedProject.slug;
        }

        const project = await CurseHelper.queryModById(id);

        await dbclient.cachedProject.create({
            data: {
                id: id,
                slug: project.mod.slug,
                fileId: project.latestFile?.id,
                filename: project.latestFile?.fileName,
                subscribedGuilds: {
                    connect: {
                        id: guildId
                    }
                }
            }
        })

        return project.mod.slug;
    }

    static editProjectVersion(transactionId: string, projectId: number, newVersion: { id: number | undefined, filename: string | undefined }): void {
        DBHelper.enqueueInTransaction(transactionId, 
            dbclient.cachedProject.update({
                where: {
                    id: projectId,
                },
                data: {
                    fileId: newVersion.id,
                    filename: newVersion.filename
                }
            })
        );
    }


    static async cleanupProject(id: number, transactionId: string | null): Promise<boolean> {

        const matches = await dbclient.cachedProject.findUnique({
            where: {
                id: id
            },
            select: {
                _count: {
                    select: {
                        subscribedGuilds: true
                    }
                }
            }
        })

        //project does not exist => abort cleanup
        if (matches === null) {
            return false;
        }

        //subscribed guilds are 0 => remove this project from cache
        if (matches._count.subscribedGuilds === 0) {
            await this.removeProject(id, transactionId);
            return true;
        }

        return false;
    }

    static async removeProject(id: number, transactionId: string | null) {
        const promise = dbclient.cachedProject.delete({
            where: {
                id: id,
            }
        })

        if (transactionId != null) {
            DBHelper.enqueueInTransaction(transactionId, promise);
        }
        else {
            await promise;
        }
    }
}