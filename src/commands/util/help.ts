import { buildHelpEmbed } from "../../embedBuilder";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[]) {
    const embed = buildHelpEmbed('Commands: ', args[0]);
    return embed;
}

export const comm: Command = new Command(
    'help', 
    {
        description: 'Sends this embed message with names and descriptions of all the commands',
        isGuild: false,
        action: run,
        permLevel: Permission.USER,
        argNames: [],
        async: false
    }
);