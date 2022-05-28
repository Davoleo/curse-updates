import { PrismaClient, PrismaPromise } from "@prisma/client";
import { logger } from "../main";

const activeTransactions: Map<string, PrismaPromise<unknown>[]> = new Map();

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

/**
 * @param id of the transaction
 */
function enqueueInTransaction(id: string, queryPromise: PrismaPromise<unknown>) {
    if (activeTransactions.has(id)) {
        activeTransactions.get(id)?.push(queryPromise);
    }
    else {
        activeTransactions.set(id, [queryPromise]);
    }
}

async function runTransaction(id: string): Promise<unknown[]> {
    if (activeTransactions.has(id)) {
        const transaction = activeTransactions.get(id);
        activeTransactions.delete(id);
        return await dbclient.$transaction(transaction!);
    }
    else {
        throw new Error('No active transaction for id: ' + id);
    }
    
}

export const DBHelper = {
    init,
    enqueueInTransaction,
    runTransaction
}
