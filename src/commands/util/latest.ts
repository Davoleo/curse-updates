import { CommandInteraction } from "discord.js";
import Command from "../../model/Command";
import { CommandGroup } from "../../model/CommandGroup";
import { CommandPermission } from "../../utils";

function latest(interaction: CommandInteraction) {
    
    //const modData = await CurseHelper.queryModById(Number(args[0]));
	//const response: MessageEmbed = buildModEmbed(modData);
        
    interaction.reply("Should be querying project: " + interaction.options.getInteger('project id', true));
}

export const comm: Command = new Command(
    'latest', 
    'Queries CurseForge to get information regarding the latest version of a project',
    CommandGroup.GENERAL,
    CommandPermission.USER
).addIntegerOption(option => option
    .setName('project id')
    .setDescription('The id of the CurseForge Project to fetch')
    .setRequired(true)
)
.setAction(latest)