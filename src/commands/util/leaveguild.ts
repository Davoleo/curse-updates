import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

async function run(args: string[], messageRef: Message) {
    const guild = await messageRef.client.guilds.fetch(args[0]);
    guild.leave();
    return `Guild "${guild.name}" has been left`;
}

export const comm: Command = new Command(
    'leaveguild', 
    {
        description: 'Leaves the guild given a certain guild ID',
        isGuild: false,
        action: run,
        permLevel: Permission.OWNER,
        argNames: ['id'],
        async: true
    }
);