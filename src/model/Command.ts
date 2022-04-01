import { CommandPermission } from "../utils";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandGroup } from "./CommandGroup";
import { CommandInteraction } from "discord.js";

type CommandHandler = (interaction: CommandInteraction) => void
export default class Command extends SlashCommandBuilder {

    public readonly category: CommandGroup;
    public readonly isGuildCommand:  boolean;
    private _action: CommandHandler = null;
    public readonly permissionLevel: CommandPermission;

    constructor(name: string, description: string, group: CommandGroup, permission: CommandPermission) {
        super();
        this.setName(name);
        this.setDescription(description);
        this.category = group;
        this.setDefaultPermission(permission === CommandPermission.USER);
        this.permissionLevel = permission;
    }

    execute(interaction: CommandInteraction): void {
        this._action(interaction);
    }

    get action(): CommandHandler {
        return this._action;
    }

    setAction(func: CommandHandler): Command {
        this._action = func;
        return this;
    }
}