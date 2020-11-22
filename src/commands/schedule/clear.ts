import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
    fileUtils.clearSchedule(messageRef.guild.id);
    return ':warning: Scheduled was cleared successfully! :warning:';
}

export const ping: Command = new Command(
    'clear', 
    {
        category: "schedule",
        description: 'Removes all Curseforge projects from the scheduled check that runs once every 15 minutes',
        isGuild: true,
        action: run,
        permLevel: Permission.ADMINISTRATOR,
        argNames: [],
        async: false
    }
);