import { Message } from "discord.js";
import { GuildInitializer } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission, Utils } from "../../utils";

async function run(args: string[], messageRef: Message) {
    const guild = await messageRef.client.guilds.fetch(args[0]);
    GuildInitializer.initServerConfig(guild.id, guild.name);
    const invite = (await guild.fetchInvites()).first();
    Utils.sendDMtoOwner(messageRef.client, invite.url)
    return "Initializing this server's Data Package";
}

export const comm: Command = new Command(
    'test', 
    {
        description: 'does hacky tests [it actually does nothing except testing some functions] - Internal Command only runnable by the bot author',
        isGuild: false,
        action: run,
        permLevel: Permission.OWNER,
        argNames: ['id'],
        async: true
    }
);