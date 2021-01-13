import { Message } from "discord.js";
import { GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[], messageRef: Message) {
    //Check if the project ID is an actual number before casting it
    if (args[0].match(/\d+/)[0] === '')
        return 'Project ID is invalid!';
    
    const projectID = args[0] as unknown as number;
    const wasRemoved = GuildHandler.removeProjectFromSchedule(messageRef.guild.id, projectID);
    
    if (wasRemoved) {
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
        permLevel: Permission.MODERATOR,
        argNames: ["ProjectID"],
        async: false
    }
);