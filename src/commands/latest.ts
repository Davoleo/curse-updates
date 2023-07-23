import {ChatInputCommandInteraction} from "discord.js";
import {CurseHelper} from "../curseHelper.js";
import {buildModEmbed} from "../discord/embedBuilder.js";
import Command from "../model/Command.js";
import {CommandScope} from "../model/CommandGroup.js";
import {CommandPermission} from "../util/discord.js";

async function latest(interaction: ChatInputCommandInteraction) {
    
    const modData = await CurseHelper.queryModById(interaction.options.getInteger('project_id', true));
	const response = buildModEmbed(modData);
    void interaction.reply({embeds: [response]});
}

export const command: Command = new Command(
    'latest', 
    'Queries CurseForge to get information regarding the latest version of a project',
    CommandScope.EVERYWHERE,
    CommandPermission.USER
).addIntegerOption(option => option
    .setName('project_id')
    .setDescription('The id of the CurseForge Project to fetch')
    .setRequired(true)
    .setMinValue(1)
)
.setAction(latest)