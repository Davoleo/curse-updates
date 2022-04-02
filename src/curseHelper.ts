import Curseforge, { Game } from 'node-curseforge';
import * as config from './data/config.json'
import ModData from './model/ModData';

const CFAPI = new Curseforge(config.curseForgeAPIKey);
let mcapi: Game = null;

async function init(): Promise<void> {
    mcapi = await CFAPI.get_game('minecraft');
}

async function queryModById(id: number): Promise<ModData> {
    const mod = await CFAPI.get_mod(id);
    const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
    
    return {
        mod: mod,
        latestFile: latestFile
    }
}

export const CurseHelper = {
    queryModById
}