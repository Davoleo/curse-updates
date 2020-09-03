declare module 'mc-curseforge-api' {

    export namespace SORT_TYPES {
        const FEATURED: number;
        const POPULARITY: number;
        const LAST_UPDATE: number;
        const NAME: number;
        const AUTHOR: number;
        const TOTAL_DOWNLOADS: number;
    }
    
    export type SORT_TYPES = number;

    export function getMods(options: {
        gameVersion: string;
        searchFilter: string;
        index: number;
        pageSize: number;
        sort: number;
    }): Promise<import("./objects/Mod").Mod[]>;

    export function getMod(identifier: number): Promise<import("./objects/Mod").Mod>;

    export function getModFiles(identifier: number): Promise<import("./objects/Files").ModFile[]>;

    export function getModDescription(identifier: number): Promise<string>;
}
