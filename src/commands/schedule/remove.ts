import { Message } from "discord.js";
import { CacheHandler, GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { CommandPermission } from "../../utils";

function run(args: string[], messageRef: Message) {

    if (args.length !== 1)
        return ":x: Wrong number of arguments!"

    //Check if the project ID is an actual number before casting it
    if (args[0].match(/\d+/)[0] === '')
        return 'Project ID is invalid!';
    
    const projectID = Number(args[0]);
    const wasRemoved = GuildHandler.removeProjectFromSchedule(messageRef.guild.id, projectID);
    
    if (wasRemoved) {
        CacheHandler.removeProjectById(messageRef.guild.id, projectID);
        return ":recycle: Project removed successfully!"
    }
    else
        return ":x: Couldn't find a project with that ID in the bot schedule"
}

export const comm: Command = new Command(
    'remove', 
    {
        category: "schedule",
        description: 'Removes a Curseforge project from the scheduled check that runs once every 15 minutes',
        isGuild: true,
        action: run,
        permLevel: CommandPermission.MODERATOR,
        argNames: ["ProjectID"],
        async: false
    }
);