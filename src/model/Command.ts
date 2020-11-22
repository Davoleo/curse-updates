import { Message } from "discord.js";
import { Utils, Permission } from "../utils";

export default class Command {
    private name: string;
    private description: string;
    private isGuildCommand:  boolean;
    private action: CallableFunction;
    private permissionLevel: Permission;

    constructor(name: string, description: string, isGuild: boolean, action: CallableFunction, permLevel: Permission) {
        this.name = name;
        this.description = description;
        this.isGuildCommand = isGuild;
        this.action = action;
        this.permissionLevel = permLevel;
    }

    execute(message: Message): void {
        if (this.isGuildCommand) {
            //Checks if the message was sent in a server and if the user who sent the message has the required permissions to run the command
            Utils.hasPermission(message, this.permissionLevel).then((pass) => {
                if(pass) {
                    let command = message.content;
                    if (command.startsWith('||')) {
                        //Trim the prefix
                        command = command.substr(0, '||'.length);
                        command = command.trim();
                        const splitCommand = command.split(' ');

                        if (splitCommand.shift() === this.name) {
                            const response = this.action(splitCommand, message);
                            message.channel.send(response);
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