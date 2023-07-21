import Curseforge, {Mod, ModFile} from 'node-curseforge';
import Environment from './util/Environment';
import ModData from './model/ModData';

const CFAPI = new Curseforge(Environment.get().CurseForgeAPIKey);

const GameSlugs: Map<string, number> = new Map();
const GameVersions: Map<number, Set<string>> = new Map();

const modAndModFileKeys: string[] = [
    ...Object.keys(Mod.prototype),
    ...Object.keys(ModFile.prototype)
]

async function init(): Promise<void> {
    const games = await CFAPI.get_games(0, 50)
    games.forEach(game => {
        //only valid if the game is live & ApiStatus is public
        if (game.status === 6 && game.apiStatus === 2) {
            GameSlugs.set(game.slug, game.id)
            GameVersions.set(game.id, new Set())
        }
    })

    for (const pair of GameVersions) {
        const gameId = pair[0]
        //Manually Skip 'Terraria' and 'StarCraft II' until node-curseforge is fixed
        if (gameId === 431 || gameId === 65)
            continue;

        const versions = await CFAPI.get_game_versions(gameId)
        //console.debug(pair[0].name);
        for (const verGroup of versions)
            for (const version of verGroup.versions) 
                pair[1].add(version)

        //console.warn("Error while querying: " + pair[0].name + "'s game_versions")
    }
}


async function queryModById(id: number): Promise<ModData> {
    const mod = await CFAPI.get_mod(id);
    const latestFile = mod.latestFiles.at(-1);
    
    return {
        mod: mod,
        latestFile: latestFile
    }
}

async function queryMods(ids: number[]): Promise<Map<number, ModData>> {
    const mods = await CFAPI.get_mods(0, ...ids);

    return new Map(
        mods.map(mod => {
            return [
                mod.id,
                {
                    mod: mod,
                    latestFile: mod.latestFiles.at(-1)!
                }
            ]
        }
    ));
}

function modExists(id: number): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Boolean(async (resolve: (arg0: boolean) => any) => {
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
    GameSlugs,
    GameVersions,
    modKeys: modAndModFileKeys,
    init,
    queryModById,
    queryMods,
}