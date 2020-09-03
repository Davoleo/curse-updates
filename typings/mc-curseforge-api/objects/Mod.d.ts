import { ModFile } from "./Files";

export declare class Mod {
    /**
     * @name Mod
     * @class Mod
     * @description A Mod Object representing a file of a specific mod
     * @param {Object} mod_object - Mod object to create object from
     * @property {number} id - The Curse Id of the mod.
     * @property {string} name - The display name of the mod.
     * @property {object[]} authors - An array of authors names.
     * @property {object[]} attachments - An array of attachments objects from the description.
     * @property {string} url - The url to the mods page.
     * @property {string} summary - A short description to advertise the mod.
     * @property {number} defaultFileId - The default file id of the mod.
     * @property {number} downloads - The amount of downloads of the mod.
     * @property {ModFile[]} latestFiles - An array of ModFile's containing the latest files.
     * @property {string} key - The Curse slug of the mod.
     * @property {boolean} featured - Is the mod featured?
     * @property {number} popularityScore - Some kind of score? Not sure.
     * @property {number} gamePopularityRank - The rank of the mod.
     * @property {string} primaryLanguage - the primary language of the mod
     * @property {object} logo - The attachment object of the logo of the mod.
     * @property {timestamp} created - A timestamp of the time the mod got created.
     * @property {timestamp} updated - A timestamp of the time the mod got updated.
     * @property {timestamp} released - A timestamp of the time the mod got released.
     * @property {boolean} available - true if the mod is available.
     * @property {boolean} experimental - true if the mod is experimental.
     */
    private constructor(mod_object);
    /**
     * @method Mod.getFiles
     * @description Simple function to call GetModFiles with predefined identifier.
     * @see CurseForgeAPI.getModFiles
     */
    getFiles(): Promise<ModFile[]>;
    /**
     * @method Mod.getDescription
     * @description Simple function to call GetModDescription with predefined identifier.
     * @see CurseForgeAPI.getModDescription
     */
    getDescription(): Promise<string>;
    id: number;
    name: string;
    authors: Array<Author>;
    attachments: Array<unknown>;
    url: string;
    summary: string;
    defaultFileId: number;
    downloads: number;
    latestFiles: Array<ModFile>;
    key: string;
    featured: boolean;
    popularityScore: number;
    gamePopularityRank: number;
    primaryLanguage: string;
    logo: Logo;
    updated: string;
    created: string;
    released: string;
    available: boolean;
    experimental: boolean;
}

export declare interface Author {
    name: string;
    url: string;
}

export declare interface Logo {
    url: string;
}