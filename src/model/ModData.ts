import { ModFile } from "../../typings/mc-curseforge-api/objects/Files";
import { Mod } from "../../typings/mc-curseforge-api/objects/Mod";

export default interface ModData {
    mod: Mod;
    latestFile: ModFile;
}

export interface ReleaseType {
    name: string;
    color: number;
}

export const releaseTypes: ReleaseType[] = [];
releaseTypes[3] = { name: "Alpha", color: 0xD3CAE8 };
releaseTypes[2] = { name: "Beta", color: 0x0E9BD8 };
releaseTypes[1] = { name: "Release", color: 0x14B866 };