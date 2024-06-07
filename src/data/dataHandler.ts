import {PrismaClient, PrismaPromise} from "@prisma/client";
import {Logger} from "../util/log.js";

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
        Logger.I.debug('Query: ' + event.query);
        Logger.I.debug('Params: ' + event.params);
        Logger.I.debug('Duration: ' + event.duration + 'ms');
    });

    dbclient.$on('info', (event) => {
        Logger.I.info(event.message);
    });
    dbclient.$on('warn', (event) => {
        Logger.I.warn(event.message);
    });
    dbclient.$on('error', (event) => {
        Logger.I.error(event.message);
    });
}

/**
 * @param id of the transaction
 * @param queryPromise db query to enqueue
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
        return dbclient.$transaction(transaction!);
    }
    else {
        Logger.I.warn("Attempted to run transaction for non-existent id: " + id);
        return Promise.reject('No active transaction for id: ' + id)
    }
    
}

export const DBHelper = {
    init,
    enqueueInTransaction,
    runTransaction
}
