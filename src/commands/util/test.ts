import { Message } from "discord.js";
import { GuildInitializer } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
    GuildInitializer.initServerConfig(messageRef.guild.id, messageRef.guild.name);
    return "Initializing this server's Data Package";
}

export const comm: Command = new Command(
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