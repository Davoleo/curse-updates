import { Message } from "discord.js";
import { CurseHelper } from "../../curseHelper";
import { CacheHandler, GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission, Utils } from "../../utils";

async function run(args: string[], messageRef: Message) {
    //Check if the project ID is an actual number before casting it
    if (args[0].match(/\d+/)[0] === '')
        return 'Project ID is invalid!';

    const projectID = args[0] as unknown as number;
    
    try {
        const data = await CurseHelper.queryModById(projectID);
        GuildHandler.addProjectToSchedule(messageRef.guild.id, projectID);
        
        const filename = Utils.getFilenameFromURL(data.latestFile.download_url);
        CacheHandler.addProjectToCache(projectID, data.mod.key, filename, messageRef.guild.id, true);
        return ":white_check_mark: " + data.mod.name + " has been successfully added to the schedule";
    }
    catch(error) {
        return ":x: The project corresponding to that ID doesn't exist or can't be fetched";
    }
}

export const comm: Command = new Command(
    'add', 
    {
        category: "schedule",
        description: 'Adds a Curseforge project to the scheduled check that runs once every 15 minutes',
        isGuild: true,
        action: run,
        permLevel: Permission.MODERATOR,
        argNames: ["ProjectID"],
        async: true
    }
);