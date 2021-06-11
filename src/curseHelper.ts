import * as CFAPI from 'mc-curseforge-api';
import { logger } from './main';
import ModData from './model/ModData';

async function queryModById(id: number): Promise<ModData> {
    const mod = await CFAPI.getMod(id);

    const files = await mod.getFiles();
    const latestFile = files.length === 0 ? files[files.length - 1] : mod.latestFiles[mod.latestFiles.length - 1];
    logger.info("First Attempt: ", files[files.length - 1]);
    logger.info("Second Attempt: ", mod.latestFiles[mod.latestFiles.length - 1]);
    
    return {
        mod: mod,
        latestFile: latestFile
    }
}

export const CurseHelper = {
    queryModById
}