import { Permission } from "../utils";
import { SlashCommandBuilder, SlashCommandMentionableOption } from "@discordjs/builders";

export default class Command extends SlashCommandBuilder {
    public category?: string = "";
    public isGuildCommand:  boolean;
    public action: CallableFunction;
    public permissionLevel: Permission;
    public argNames: string[];
    public async: boolean;

    constructor(name: string, options: CommandOptions) {
        super();
        this.setName(name);
        this.setDescription(options.description);
        if (options.category !== undefined)
            this.category = options.category;
        this.isGuildCommand = options.isGuild;
        this.permissionLevel = options.permLevel;
        this.argNames = options.argNames;
        this.async = options.async;
    }

    export() {
        return {
            data: {

            },
            execute: this.action
        }
    }
}

class CommandOptions {
    description: string;
    category?: string;
    isGuild: boolean; 
    action: CallableFunction; 
    permLevel: Permission; 
    argNames: string[]; 
    async: boolean;
}