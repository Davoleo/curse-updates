const { PrismaClient } = require('@prisma/client');
const { readFileSync, existsSync } = require('fs');

const prisma = new PrismaClient();

const cachedProjectsPath = 'exports/cached_projects_export.json';
const serverConfigPath = 'exports/server_config_export.json'

function main() {

    if (!existsSync(cachedProjectsPath) || !existsSync(serverConfigPath)) {
        console.error("LokiJS exported DB files do not exist => aborting seeding...");
        return;
    }

    let projectsExport = JSON.parse(readFileSync(cachedProjectsPath));
    let serversExport = JSON.parse(readFileSync(serverConfigPath));

    seedPrisma(projectsExport, serversExport)
    .then(() => console.log("Seeding Complete"))
    .catch((err) => {
        console.error(err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })
}

async function seedPrisma(projectsExport, serversExport) {

    for (const oldCondig of projectsExport) {
        await prisma.cachedProject.upsert({
            where: {
                id: oldCondig.id
            },
            update: {},
            create: {
                id: oldCondig.id,
                slug: oldCondig.slug,
                fileId: null,
                filename: null,
            }
        })
    }

    for (const oldConfig of serversExport) {
        await prisma.serverConfig.upsert({
            where: {
                id: oldConfig.serverId
            },
            update: {},
            create: {
                id: oldConfig.serverId,
                serverName: oldConfig.serverName,
                projects: {
                    connect: oldConfig.projectIds.map(id => {
                        console.log(id);
                        return {"id": id}
                    }),
                },
                announcementConfigs: {
                    create: {
                        id: undefined,
                        channel: oldConfig.releasesChannel === '-1' ? undefined : oldConfig.releasesChannel
                    } 
                }
            }
        });
    }
}

main();