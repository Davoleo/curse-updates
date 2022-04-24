import { PrismaClient } from "@prisma/client";

export const dbclient = new PrismaClient({
    log: ["query", "info", "warn", "error"]
});

export const DBHelper = {
    
}
