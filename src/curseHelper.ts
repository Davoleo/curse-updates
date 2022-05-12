import Curseforge, { Game, Mod, ModFile } from 'node-curseforge';
import Environment from './model/Environment';
import ModData from './model/ModData';

const CFAPI = new Curseforge(Environment.get().CurseForgeAPIKey);

const gameVersions: Map<Game, Set<string>> = new Map();

const modAndModFileKeys: string[] = [
    ...Object.keys(Mod.prototype),
    ...Object.keys(ModFile.prototype)
];

async function init(): Promise<void> {
    (await CFAPI.get_games(0, 50)).forEach(game => {
        gameVersions.set(game, new Set());
    });

    for (const pair of gameVersions) {
        const versions = await CFAPI.get_game_versions(pair[0]);
        for (const verGroup of versions)
            for (const version of verGroup.versions) 
                pair[1].add(version);
    }
}


async function queryModById(id: number): Promise<ModData> {
    const mod = await CFAPI.get_mod(id);
    const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
    
    return {
        mod: mod,
        latestFile: latestFile
    }
}

function modExists(id: number): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Boolean(async (resolve: (arg0: boolean) => any) => {
        await CFAPI.get_mod(id)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    }).valueOf();
    try {
        
        return true;
    } catch (err) {
        return false;
    }
}

export const CurseHelper = {
    gameVersions,
    modKeys: modAndModFileKeys,
    init,
    queryModById,
    modExists,
}