import Command from "../model/Command.js";
import {CommandScope} from "../model/CommandGroup.js";
import {CommandPermission} from "../util/discord.js";

/*
function test(args: string[], messageRef: Message) {
    if (args[0] == undefined)
        return "Need ID arg"
    const guild = await messageRef.client.guilds.fetch(args[0]);
    GuildInitializer.initServerConfig(guild.id, guild.name);
    //const invite = (await guild.fetchInvites()).first();
    //Utils.sendDMtoOwner(messageRef.client, invite.url)
    return `Initializing ${guild.name} Data Package`;
}
*/

export const command = new Command(
    'test', 
    'Tests some functions - Internal Command',
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
);