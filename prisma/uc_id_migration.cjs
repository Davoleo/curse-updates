//Updates Configs ID migration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const serverConfigs = await prisma.serverConfig.findMany();

    for (const server of serverConfigs) {
        const configs = await prisma.announcementsConfig.findMany({
            where: {
                server: {
                    id: server.id,
                }
            },
        });

        console.log("Migrating %s - found %d configs", server.serverName, configs.length);
        const migrationSteps = [];
        for (let i = 1; i <= configs.length; i++) {
            migrationSteps.push(prisma.announcementsConfig.update({
                where: {
                    id_serverId: {
                        serverId: server.id,
                        id: configs[i-1].id,
                    }
                },
                data: {
                    id: i,
                }
            }));
        }
        await prisma.$transaction(migrationSteps);
    }
}

main()
    .then(_ => console.log("UC ID Migration complete!"))
    .catch(reason => console.error(reason));