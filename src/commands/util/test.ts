import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
    fileUtils.initSaveGuild(messageRef.guild.id);
}

export const ping: Command = new Command(
    'test', 
    {
        description: 'does hacky tests [it actually does nothing except testing some functions] - Internal Command only runnable by the bot author',
        isGuild: true,
        action: run,
        permLevel: Permission.DAVOLEO,
        argNames: [],
        async: false
    }
);