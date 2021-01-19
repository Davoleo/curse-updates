import { buildHelpEmbed } from "../../embedBuilder";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[]) {
    const category = args[0];
    const embed = buildHelpEmbed('Commands: ', category);
    return embed;
}

export const comm: Command = new Command(
    'help', 
    {
        description: 'Sends an embed message with names and descriptions of commands in the written category',
        isGuild: false,
        action: run,
        permLevel: Permission.USER,
        argNames: ["category"],
        async: false
    }
);