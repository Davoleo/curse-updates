import { MessageEmbed } from "discord.js";
import { CurseHelper } from "../../curseHelper";
import { buildModEmbed } from "../../embedBuilder";
import Command from "../../model/Command";
import { CommandPermission } from "../../utils";

async function run(args: string[]) {
    if (args[0] !== '') {

        //Check if the project ID is an actual number before casting it
        if (args[0].match(/\d+/)[0] === '')
            return 'Project ID is invalid!';

        const modData = await CurseHelper.queryModById(Number(args[0]));
		const response: MessageEmbed = buildModEmbed(modData);
        
        if (response !== undefined && response !== null) {
            return response;
        }
        else {
            return "Invalid Response!"
        }
    } else 
        return "Project ID argument can't be empty!"
}

export const comm: Command = new Command(
    'latest', 
    {
        description: 'Queries CurseForge to get information regarding the latest version of a project',
        isGuild: true,
        action: run,
        permLevel: CommandPermission.USER,
        argNames: ["ProjectID"],
        async: true
    }
);