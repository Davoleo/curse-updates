import { CommandPermission } from "../utils";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandGroup } from "./CommandGroup";

export default class Command extends SlashCommandBuilder {

    public readonly category: CommandGroup;
    public readonly isGuildCommand:  boolean;
    public action: CallableFunction;
    public readonly permissionLevel: CommandPermission;

    constructor(name: string, description: string, group: CommandGroup, permission: CommandPermission) {
        super();
        this.setName(name);
        this.setDescription(description);
        this.category = group;
        this.setDefaultPermission(permission === CommandPermission.USER);
        this.permissionLevel = permission;
    }
}