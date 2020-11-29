import { Message } from "discord.js";
import { GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[], message: Message) {
    if (args === [] || args[0].length > 3) {
        return 'You can only assign a string of up to 3 characters as prefix';
    }
    else {
        GuildHandler.updatePrefix(message.guild.id, args[0]);
        return '`' + args[0] + '` is now the current prefix for commands';
    }
}

export const ping: Command = new Command(
    'changeprefix', 
    {
        description: 'Changes the command prefix of the bot to the string passed as an argument',
        isGuild: true,
        action: run,
        permLevel: Permission.MODERATOR,
        argNames: ["newPrefix"],
        async: false
    }
);