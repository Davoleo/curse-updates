import { CommandPermission } from "../utils";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandGroup } from "./CommandGroup";
import { CommandInteraction } from "discord.js";

type CommandHandler = (interaction: CommandInteraction) => void
export default class Command extends SlashCommandBuilder {

    public readonly category: CommandGroup;
    public readonly isGlobal:  boolean;
    private _actions: Map<string, CommandHandler> = new Map();
    public readonly permissionLevel: CommandPermission;

    constructor(name: string, description: string, group: CommandGroup, permission: CommandPermission) {
        super();
        this.setName(name);
        this.setDescription(description);
        this.category = group;
        this.setDefaultPermission(permission !== CommandPermission.OWNER);
        this.permissionLevel = permission;
    }

    execute(interaction: CommandInteraction, subcommand = ""): void {
        if (this._actions.has(subcommand))
            this._actions.get(subcommand)(interaction);
    }
    
    //? Maybe Remove
    // getAction(subcommand = ""): CommandHandler {
    //     if (this._actions.has(subcommand))
    //         return this._actions.get(subcommand);
    //     else
    //         return () => {/* noop */};
    // }

    setAction(func: CommandHandler, subcommand = ""): Command {
        this._actions.set(subcommand, func);
        return this;
    }
}