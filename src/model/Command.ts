import { Permission } from "../utils";

export default class Command {
    public name: string;
    public description: string;
    public category?: string = "";
    public isGuildCommand:  boolean;
    public action: CallableFunction;
    public permissionLevel: Permission;
    public argNames: string[];
    public async: boolean;

    constructor(name: string, options: CommandOptions) {
        this.name = name;
        this.description = options.description;
        if (options.category !== undefined)
            this.category = options.category;
        this.isGuildCommand = options.isGuild;
        this.action = options.action;
        this.permissionLevel = options.permLevel;
        this.argNames = options.argNames;
        this.async = options.async;
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