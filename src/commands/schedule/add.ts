import { Message } from "discord.js";
import { CurseHelper } from "../../curseHelper";
import { CacheHandler, GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission, Utils } from "../../utils";

async function run(args: string[], messageRef: Message) {

    if (args.length !== 1)
        return ":x: Wrong number of arguments!"

    //Check if the project ID is an actual number before casting it
    if (args[0].match(/\d+/)[0] === '')
        return 'Project ID is invalid!';

    const projectID = Number(args[0].trim());
    
    try {
        const data = await CurseHelper.queryModById(projectID);
        const filename = Utils.getFilenameFromURL(data.latestFile.download_url);
        if (data.mod.key == undefined)
            throw Error("NULL_slug!")

        GuildHandler.addProjectToSchedule(messageRef.guild.id, projectID);
        CacheHandler.addProjectToCache(projectID, data.mod.key, filename, messageRef.guild.id, true);

        return ":white_check_mark: " + data.mod.name + " has been successfully added to the schedule";
    }
    catch(error) {
        if (error.message === "NULL_slug!")
            return ":x: The project corresponding to that ID doesn't exist or can't be fetched";
        else if (error.message === "Too_Many_Projects")
            return ":x: You have reached the project number limit for this guild, please remove some";
        else if (error.message === "Project_Already_Scheduled")
            return ":x: This project was already added to this server's schedule";
        else
            return `:x: Unexpected Error: ${error.message}!`;
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