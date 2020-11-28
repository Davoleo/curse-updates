import { buildHelpEmbed } from "../../embedBuilder";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[]) {

    const embed = buildHelpEmbed('Commands: ', args[0]);
    
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