import * as CFAPI from 'mc-curseforge-api';
import ModData from './model/ModData';

async function queryModById(id: number): Promise<ModData> {
    const mod = await CFAPI.getMod(id);
    const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
    
    return {
        mod: mod,
        latestFile: latestFile
    }
}

export const CurseHelper = {
    queryModById
}