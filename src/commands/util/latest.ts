import { MessageEmbed } from "discord.js";
import Command from "../../model/Command";
import { Permission, Utils } from "../../utils";

async function run(args: string[]) {
    if (args[0] !== '') {
		const response: MessageEmbed = await Utils.queryLatest(args[0] as unknown as number);
        
        if (response !== undefined && response !== null) {
            return response;
        }
        else {
            return "Invalid Response!"
        }
    } else 
        return "Project ID argument can't be empty!"
}

export const ping: Command = new Command(
    'latest', 
    {
        description: 'Queries CurseForge to get information regarding the latest version of a project',
        isGuild: true,
        action: run,
        permLevel: Permission.USER,
        argNames: ["ProjectID"],
        async: true
    }
);