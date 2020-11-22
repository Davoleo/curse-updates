import { commands } from "../../commands";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run() {

    const embed = Utils.createEmbed('Commands: ');

    commands.forEach(command => {
        if (command.argNames.length > 0) {
            let commandName = config.prefix + command.name;
            command.argNames.forEach(argument => {
                commandName += " `" + argument + "`";
            });

            embed.addField({
                name: commandName,
                value: command.description,
            });
        } 
        else {
            embed.addField({
                name: config.prefix + command.name,
                value: command.description,
            });
        }
    });
    
    return embed;
}

export const ping: Command = new Command(
    'ping', 
    {
        description: 'Sends a message with information about the latency of the bot response',
        isGuild: false,
        action: run,
        permLevel: Permission.USER,
        argNames: [],
        async: false
    }
);