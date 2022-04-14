/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const { mkdirSync, writeFileSync, existsSync } = require('fs');
const loki = require('lokijs');

const oldDatabase = new loki("../data.old.db", {
    autoload: true,
    autoloadCallback: lokiLoadComplete
});

const prisma = new PrismaClient();

let lokiExport;
let serversExport;
let projectsExport;

function lokiLoadComplete() {
    
    exportLokiJS();

    seedPrisma()
    .then(() => console.log("Seeding Complete"))
    .catch((err) => {
        console.error(err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })
}

function exportLokiJS() {

    if (!existsSync('../exports'))
        mkdirSync('../exports');

    serversExport = oldDatabase.getCollection("server_config").find({});
    writeFileSync('../exports/server_config_export.json', JSON.stringify(serversExport))
    projectsExport = oldDatabase.getCollection("cached_projects").find({});
    writeFileSync('../exports/cached_projects_export.json', JSON.stringify(projectsExport));

    /*
    lokiExport = serversExport.slice();

    console.dir(lokiExport);

    for (let i = 0; i < lokiExport.length; i++) {
        for (let j = 0; j < lokiExport[i].projectIds.length; j++) {
            if (j === 0) 
                lokiExport[i].projects = [];

            projectsExport.forEach(cachedProject => {
                if (lokiExport[i].projectIds[j] === cachedProject.id);
                    lokiExport[i].projects[j] = cachedProject;
            })
        }

        delete lokiExport[i].projectIds;
    }

    writeFileSync('../exports/loki_export.json', JSON.stringify(lokiExport));
    */
    oldDatabase.close();
}

async function seedPrisma() {

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