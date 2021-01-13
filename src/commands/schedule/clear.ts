import { Message } from "discord.js";
import { CacheHandler, GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
    const projectIDs = GuildHandler.getServerConfig(messageRef.guild.id).projectIds;
    GuildHandler.clearProjectsSchedule(messageRef.guild.id);
    CacheHandler.removeAllByGuild(messageRef.guild.id, projectIDs);
    return ':warning: Scheduled was cleared successfully!';
}

export const comm: Command = new Command(
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