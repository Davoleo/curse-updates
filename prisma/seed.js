/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('fs');

const prisma = new PrismaClient();

function main() {

    let projectsExport = JSON.parse(readFileSync('exports/cached_projects_export.json'));
    let serversExport = JSON.parse(readFileSync('exports/server_config_export.json'));

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
                version: oldCondig.version
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
                announcementConfigs: {
                    create: {
                        id: 0,
                        channel: oldConfig.releasesChannel === '-1' ? undefined : oldConfig.releasesChannel
                    } 
                }
            }
        });

        for (const pid of oldConfig.projectIds) {
            await prisma.assignedProject.upsert({
                where: {
                    projectId_serverId: {
                        projectId: pid,
                        serverId: oldConfig.serverId
                    }
                },
                update: {},
                create: {
                    projectId: pid,
                    serverId: oldConfig.serverId
                }
            })
        }
    }
}

main();