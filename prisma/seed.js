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

    const serversExport = oldDatabase.getCollection("server_config").find({});
    const projectsExport = oldDatabase.getCollection("cached_projects").find({});

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
    oldDatabase.close();
}

async function seedPrisma() {

    for (const oldConfig of lokiExport) {

        let projects = {};

        if (oldConfig.projects) {
            projects = oldConfig.projects.map(project => {
                return {
                    where: {
                        projectId: project.id
                    },
                    create: {
                        projectId: project.id,
                        slug: project.slug,
                        version: project.version
                    }
                }
            });
        }

        await prisma.serverConfig.create({data: {
            serverId: oldConfig.serverId,
            serverName: oldConfig.serverName,
            projects: {
                connectOrCreate: projects
            },
            announcementConfigs: {
                create: {
                    channel: oldConfig.releasesChannel === '-1' ? undefined : oldConfig.releasesChannel
                }
            }
        }});
    }
}