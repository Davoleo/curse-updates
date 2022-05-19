import { PrismaClient } from "@prisma/client";
import { logger } from "../main";

export const dbclient = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
        {
            emit: 'event',
            level: 'error',
        }
    ]
});

function init() {
    dbclient.$on('query', (event) => {
        logger.info('Query: ' + event.query);
        logger.info('Params: ' + event.params);
        logger.info('Duration: ' + event.duration + 'ms');
    });

    dbclient.$on('info', (event) => {
        logger.info(event.message);
    });
    dbclient.$on('warn', (event) => {
        logger.warn(event.message);
    });
    dbclient.$on('error', (event) => {
        logger.error(event.message);
    });
}

export const DBHelper = {
    init
}
