import { Mod, ModFile } from "node-curseforge";

export default interface ModData {
    mod: Mod;
    latestFile: ModFile | undefined;
}

/**
 * Indexable via @type FileReleaseType
 */
export const RELEASE_COLORS = [
    0x404040,   //UNKNOWN
    0x14B866,   //RELEASE
    0x0E9BD8,   //BETA
    0xD3CAE8    //ALPHA
];

// export type ReleaseType = {
//     type: FileReleaseType, 
//     color: typeof releaseColors[FileReleaseType]
// };