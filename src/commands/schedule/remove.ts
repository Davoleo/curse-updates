import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[], messageRef: Message) {
    if (args[0].match(/\d+/)[0] === '')
        return 'Project ID is invalid!';
    
    const projectID = args[0] as unknown as number;
    const stringResult = fileUtils.removeProjectFromConfig(messageRef.guild.id, projectID);
    return stringResult;
}

export const ping: Command = new Command(
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