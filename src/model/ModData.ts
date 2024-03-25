import {Mod, ModFile} from "node-curseforge";

export default interface ModData {
    mod: Mod;
    latestFile: ModFile | undefined;
    latestChangelog: string | undefined;
}

/**
 * Indexable via @type FileReleaseType
 */
export const RELEASE_COLORS = [
    0x404040,   //UNKNOWN
    0x259C3F,   //RELEASE
    0xA278C7,   //BETA
    0xF9BB3C    //ALPHA
];

// export type ReleaseType = {
//     type: FileReleaseType, 
//     color: typeof releaseColors[FileReleaseType]
// };