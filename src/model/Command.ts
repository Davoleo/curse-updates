import { Message } from "discord.js";
import { Utils, Permission } from "../utils";

export default class Command {
    public name: string;
    public description: string;
    private category?: string = "";
    private isGuildCommand:  boolean;
    private action: CallableFunction;
    private permissionLevel: Permission;
    public argNames: string[];
    private async: boolean;

    constructor(name: string, options: CommandOptions) {
        this.name = name;
        this.description = options.description;
        this.category = options.category;
        this.isGuildCommand = options.isGuild;
        this.action = options.action;
        this.permissionLevel = options.permLevel;
        this.argNames = options.argNames;
        this.async = options.async;
    }

    execute(message: Message): void {
        if (this.isGuildCommand) {
            fileUtils.initSaveGuild(message.guild.id);
            //Checks if the message was sent in a server and if the user who sent the message has the required permissions to run the command
            Utils.hasPermission(message, this.permissionLevel).then((pass) => {
                if(pass) {
                    let command = message.content;
                    if (command.startsWith('||')) {
                        //Trim the prefix
                        command = command.substr(0, '||'.length);
                        command = command.trim();
                        const splitCommand = command.split(' ');

                        if (this.category === "" || splitCommand.shift() === this.category) {
                            if (splitCommand.shift() === this.name) {
                                if (!this.async) {
                                    const response = this.action(splitCommand, message);
                                    message.channel.send(response);
                                } else {
                                    this.action(splitCommand, message).then((response: unknown) => {
                                        message.channel.send(response);
                                    })
                                    .catch((error: string) => {
                                        console.warn("Error: ", error)
                                        message.channel.send('There was an error during the async execution of the command `' + name +  '`, Error: ' + error);
                                    })
                                }
                            }
                        }
                    }
                }
            });
        } else {
            const response = this.action(message.content);
            message.channel.send(response);
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