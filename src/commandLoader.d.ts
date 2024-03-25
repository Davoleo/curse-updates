import Command from "../src/model/Command.js";

export function loadCommandFiles(): Promise<Command[]>;

export function initCommands(commands: Command[]): void;