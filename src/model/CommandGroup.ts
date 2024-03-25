export enum CommandGroup {
    GENERAL,
    SCHEDULE
}

export type CommandGroupStrings = keyof typeof CommandGroup;

export enum CommandScope {
    EVERYWHERE,
    SERVER
}