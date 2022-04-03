import Command from "../src/model/Command";

export function loadCommandFiles(): Promise<Command[]>;

export function initCommands(commands: Command[]): void;