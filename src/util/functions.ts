function allDefined<T>(array: Array<T | undefined | null>): array is Array<T> {
    for (const obj of array) {
        if (obj === undefined || obj === null)
            return false;
    }
    return true;
}

function filterDefined<T>(array: Array<T | undefined | null>): Array<T> {
    const filtered: T[] = [];
    array.forEach(obj => {
        if (obj !== undefined && obj !== null) 
            filtered.push(obj);
    });
    return filtered;
}

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const utilFunctions = {
    allDefined,
    filterDefined,
    sleep
}