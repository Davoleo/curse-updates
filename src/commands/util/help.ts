import { CommandInteraction } from "discord.js";
import Command from "../../model/Command";
import { CommandGroup } from "../../model/CommandGroup";
import { CommandPermission } from "../../utils";

function help(interaction: CommandInteraction) {
    const category = interaction.options.getString('category', false);
    //const embed = buildHelpEmbed('Commands: ', category);
    interaction.reply('Showing help for category: ' + category !== null ? category : 'general')
}

export const comm = new Command(
    'help', 
    'Sends an embed message with names and descriptions of commands in the written category',
    CommandGroup.GENERAL,
    CommandPermission.USER
)
.addStringOption(option => option
    .setName('category')    
    .setRequired(false)
    .setChoices([
        ["General Category", "general"],
        ["Schedule Category", "schedule"]
    ])
)
.setAction(help)