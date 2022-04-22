import Command from "../model/Command";
import { CommandScope } from "../model/CommandGroup";
import { CommandPermission } from "../utils";

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
    'Tests some functions - Internal Command only runnable by the bot author',
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
);