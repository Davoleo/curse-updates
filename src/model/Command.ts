import {CommandPermission, Utils} from "../util/discord.js";
import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from "@discordjs/builders";
import {CommandScope} from "./CommandGroup.js";
import {AutocompleteInteraction, CommandInteraction} from "discord.js";
import {logger} from "../main.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library.js";
import UninitializedGuildError from "./UninitializedGuildError.js";
import GuildService from "../services/GuildService.js";

type CommandHandler = (interaction: CommandInteraction) => Promise<void> | void;
type AutocompleteHandler = (interaction: AutocompleteInteraction) => void;

type NameAndDescription = {name: string, description: string}
export default class Command extends SlashCommandBuilder {

    public readonly scope: CommandScope;
    private _actions: Map<string, CommandHandler> = new Map();
    private _autocompleteHandler: AutocompleteHandler | null;
    public readonly permissionLevel: CommandPermission;

    private readonly subcommandsData: NameAndDescription[] = [];

    constructor(name: string, description: string, scope: CommandScope, permission: CommandPermission) {
        super();
        this.setName(name);
        this.setDescription(description);
        this.setDefaultPermission(permission !== CommandPermission.OWNER);
        this.setDMPermission(scope == CommandScope.EVERYWHERE);
        this.permissionLevel = permission;
        this.scope = scope;
    }

    async execute(interaction: CommandInteraction, subcommand: string) {
        //Check if the user has permission to run the command
        if (!Utils.hasPermission(interaction.user.id, interaction.memberPermissions, this.permissionLevel)) {
            void interaction.reply(":x: You don't have enough permissions to run this command.");
            return;
        }

        //Server-only commands can't be runnable outside their scope
        if (this.scope === CommandScope.SERVER && !interaction.inGuild()) {
            void interaction.reply(":x: This command can only be executed inside servers!")
            return;
        }

        try {
            logger.info("calling: ", interaction.commandName, subcommand)

            if (this._actions.has(subcommand)) {
                const action = this._actions.get(subcommand)!
                await action(interaction)
            }
        }
        catch(error) {

            if (error instanceof PrismaClientKnownRequestError) {
                void interaction.reply({ content: ":x: Generic Data Error", ephemeral: true })
                logger.error(`Prisma Error (${error.code}): ${error.message}`)
            }
            else if (error instanceof UninitializedGuildError) {
                logger.warn("Uninitialized guild " + interaction.guild?.name + ", now initializing...")
                await GuildService.initServer({ id: interaction.guildId!, name: interaction.guild!.name })
                void interaction.reply({content: ":x: Server config was not yet populated, **this is a one-time only error, please try again.**", ephemeral: true})
            }
            else if (error.code === 400) {
                logger.error("Request Error (" + error.code + "): " + error.name);
                logger.error(error.message);
                void interaction.reply(":x: **CurseForge Bad Request Error!**");
            }
            else if (error.code === 503 || error.code === 500) {
                logger.error("CurseForge Server Error (" + error.code + "): " + error.name);
                logger.error(error.message);
                void interaction.reply(":x: CurseForge Error!")
            }
            else if (error instanceof Error) {
                await interaction.reply({content: `Error: ${error.name} while running command \`${this.name } ${subcommand}\``});
                void interaction.followUp(error.message);
            
                logger.warn("Running command: " + this.name + " " + subcommand + "has failed!!");
                logger.error(error.name + ': ' + error.message);
            }
        }
    }

    handleAutocomplete(interaction: AutocompleteInteraction): void {
        if (this._autocompleteHandler) {
            this._autocompleteHandler(interaction);
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

    setAutocompleteHandler(handler: AutocompleteHandler): Command {
        this._autocompleteHandler = handler;
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