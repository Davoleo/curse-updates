import { Mod } from "./Mod";

export declare class ModFile {
    /**
     * @name ModFile
     * @class ModFile
     * @description A File Object representing a file of a specific mod
     * @param {Object} file_object - File object to create object from
     * @property {string[]} minecraft_versions - The minecraft versions this mod file is compatible with.
     * @property {string} file_name - The name of the mod file it got stored with.
     * @property {string} file_size - The size of the mod file as string. (Yeah it's gross)
     * @property {string} release_type - the type of the mod file release.
     * @property {string} mod_key - The Curse slug of the mod the file belongs to.
     * @property {string} download_url - The url to the mod file to download.
     * @property {number} downloads - The amount of downloads of this mod file.
     * @property {timestamp} timestamp - A timestamp of the time the file got uploaded.
     * @property {string[]} mod_dependencies - A list of dependencies for this file.
     * @property {boolean} available - true if the file is available.
     */
    private constructor(file_object);
    /**
     * @method ModFile.download
     * @description Download the file to a specific file
     * @param {string} path - absolute path to save the mod to.
     * @param {boolean} override - Should the file be overwritten if it already exists? Defaults to false.
     * @param {boolean} simulate - Doesn't download a file it just tries to find the proper website. Used for testing.
     * @param {function} callback - Optional callback to use as alternative to Promise.
     * @returns {Promise.<path>} A Promise containing the selected absolute path for convenience.
     */
    download(path: string, override: boolean, simulate: boolean, url?: string, tries?: number): Promise<string>;
    /**
     * @private
     * @param {curseforge.getMod} method
     * @param {function} callback
     */
    private __please_dont_hate_me;
    /**
     * @method ModFile.getDependencies
     * @description Get all dependencies required by this mod.
     * @param {function} callback - Optional callback to use as alternative to Promise
     * @returns {Promise.<Mod[]>} Array of Mods who are marked as dependency.
     */
    getDependencies(): Promise<Mod[]>;
    /**
     * @method ModFile.getDependenciesFiles
     * @description Get all dependencies required by this mod.
     * @param {function} callback - Optional callback to use as alternative to Promise
     * @returns {Promise.<ModFile[], Error>} Array of ModFiles who are marked as dependency.
     */
    getDependenciesFiles(): Promise<ModFile[]>;
    id: number;
    minecraft_versions: Array<string>;
    file_name: string;
    file_size: string;
    timestamp: Date;
    release_type: string;
    download_url: string;
    downloads: number;
    mod_dependencies: Array<string>;
    alternate: unknown;
    alternate_id: number;
    available: boolean;
}
