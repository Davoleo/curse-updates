import { CommandPermission, Utils } from "../util/discord";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CommandScope } from "./CommandGroup";
import { CommandInteraction } from "discord.js";
import { logger } from "../main";

type CommandHandler = (interaction: CommandInteraction) => void

type NameAndDescription = {name: string, description: string}
export default class Command extends SlashCommandBuilder {

    public readonly scope: CommandScope;
    private _actions: Map<string, CommandHandler> = new Map();
    public readonly permissionLevel: CommandPermission;

    private readonly subcommandsData: NameAndDescription[] = [];

    constructor(name: string, description: string, scope: CommandScope, permission: CommandPermission) {
        super();
        this.setName(name);
        this.setDescription(description);
        this.setDefaultPermission(permission !== CommandPermission.OWNER);
        this.permissionLevel = permission;
        this.scope = scope;
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

        try {
            if (this._actions.has(subcommand))
            this._actions.get(subcommand)!(interaction);
        }
        catch(error) {
            if (error instanceof Error) {
                interaction.reply({content: `Error: ${error.name} while running command \`${this.name } ${subcommand}\``});
                interaction.followUp(error.message);
            
                logger.warn("Running command: " + this.name + " " + subcommand + "has failed!!");
                logger.error(error.name + ': ' + error.message);
            }
        }
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
    
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): SlashCommandSubcommandsOnlyBuilder {

        if (input instanceof SlashCommandBuilder) {
            this.subcommandsData.push(input);
        }
        else if (typeof input === 'function') {
            const subCommand = input(new SlashCommandSubcommandBuilder());
            this.subcommandsData.push(subCommand);
        }

        return super.addSubcommand(input);
    }

    getSubCommands(): NameAndDescription[] {
        return this.subcommandsData;
    }
}