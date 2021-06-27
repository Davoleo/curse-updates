import * as CFAPI from 'mc-curseforge-api';
import { logger } from './main';
import ModData from './model/ModData';

async function queryModById(id: number): Promise<ModData> {
    const mod = await CFAPI.getMod(id);

    //const files = await mod.getFiles();
    //const latestFile = files.length === 0 ? files[files.length - 1] : mod.latestFiles[mod.latestFiles.length - 1];
    //logger.info("First Attempt: ", files[files.length - 1]);
    if (mod.latestFiles[mod.latestFiles.length - 1] !== undefined)
        logger.info(`Latest ${mod.name} File: `, mod.latestFiles[mod.latestFiles.length - 1].file_name);
    
    return {
        mod: mod,
        latestFile: mod.latestFiles[mod.latestFiles.length - 1]
    }
}

export const CurseHelper = {
    queryModById
}