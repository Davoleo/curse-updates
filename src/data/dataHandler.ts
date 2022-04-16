import { PrismaClient, ServerConfig } from "@prisma/client";

export const dbclient = new PrismaClient({
    log: ["query", "info", "warn", "error"]
});

async function getAllServerConfigs(): Promise<ServerConfig[]> {
    return await dbclient.serverConfig.findMany();
}

export const DBHelper = {
    getAllServerConfigs
}
