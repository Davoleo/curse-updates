import { Mod } from "./objects/Mod";
import { ModFile } from "./objects/Files";

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
}): Promise<Mod[]>;
export function getMod(identifier: number): Promise<Mod>;
export function getModFiles(identifier: number): Promise<ModFile[]>;
export function getModDescription(identifier: number): Promise<string>;
