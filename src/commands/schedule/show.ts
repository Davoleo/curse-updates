
import { Message } from "discord.js";
import { buildScheduleEmbed } from "../../embedBuilder";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[], messageRef: Message) {
    return buildScheduleEmbed(messageRef.guild.id)
}

export const comm: Command = new Command(
    'show', 
    {
        category: "schedule",
        description: 'Shows the scheduled project updates announcements of the current server and the announcements channel',
        isGuild: true,
        action: run,
        permLevel: Permission.USER,
        argNames: [],
        async: false
    }
);