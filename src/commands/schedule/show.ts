
import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission, Utils } from "../../utils";

async function run(args: string[], messageRef: Message) {
    return await Utils.buildScheduleEmbed(messageRef.guild.id, messageRef.client)
}

export const ping: Command = new Command(
    'show', 
    {
        category: "schedule",
        description: 'Shows the scheduled project updates announcements of the current server and the announcements channel',
        isGuild: true,
        action: run,
        permLevel: Permission.USER,
        argNames: [],
        async: true
    }
);