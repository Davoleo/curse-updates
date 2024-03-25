import TurndownService from 'turndown';

const turndownService = new TurndownService({
    headingStyle: 'atx', // # type heading
    fence: '```',        // discord supported fence
    bulletListMarker: '-', // discord supported bullets
    hr: '\n━━━━━━━\n',     // discord does not support <hr> => create a similar thing with custom char
})

function allDefined<T>(array: Array<T | undefined | null>): array is Array<T> {
    for (const obj of array) {
        if (obj === undefined || obj === null)
            return false;
    }
    return true;
}

function filterDefined<T>(array: Array<T | undefined | null>): Array<T> {
    const filtered: T[] = [];

    for (const obj of array) {
        if (obj) {
            filtered.push(obj);
        }
    }

    return filtered;
}

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function turndownHTML(html: string) {
    return turndownService.turndown(html);
}

export const utilFunctions = {
    allDefined,
    filterDefined,
    sleep,
    turndownHTML,
}