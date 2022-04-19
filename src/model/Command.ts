import { CommandPermission, Utils } from "../utils";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandScope } from "./CommandGroup";
import { CommandInteraction } from "discord.js";

type CommandHandler = (interaction: CommandInteraction) => void
export default class Command extends SlashCommandBuilder {

    public readonly scope: CommandScope;
    private _actions: Map<string, CommandHandler> = new Map();
    public readonly permissionLevel: CommandPermission;

    constructor(name: string, description: string, scope: CommandScope, permission: CommandPermission) {
        super();
        this.setName(name);
        this.setDescription(description);
        this.setDefaultPermission(permission !== CommandPermission.OWNER);
        this.permissionLevel = permission;
    }

    execute(interaction: CommandInteraction, subcommand = ""): void {
        //Check if the user has permission to run the command
        if (!Utils.hasPermission(interaction.user.id, interaction.memberPermissions, this.permissionLevel)) {
            interaction.reply(":x: You don't have enough permissions to run this command.");
            return;
        }

        //Server-only commands can't be runnable outside their scope
        if (this.scope === CommandScope.SERVER && !interaction.inGuild()) {
            interaction.reply(":x: This command can only be executed inside servers!")
            return;
        }

        if (this._actions.has(subcommand))
            this._actions.get(subcommand)!(interaction);
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