import {ChatInputCommandInteraction} from "discord.js";
import {buildHelpEmbed} from "../discord/embedBuilder.js";
import Command from "../model/Command.js";
import {CommandScope} from "../model/CommandGroup.js";
import {CommandPermission} from "../util/discord.js";

function help(interaction: ChatInputCommandInteraction) {
    const command = interaction.options.getString('command', false);
    const embed = command ? buildHelpEmbed(command) : buildHelpEmbed();
    void interaction.reply({embeds: [embed]});
}

export const command = new Command(
    'help', 
    'Sends an embed message with names and descriptions of commands in the written category',
    CommandScope.EVERYWHERE,
    CommandPermission.USER
)
.setAction(help)
.addStringOption(option => option
    .setName('command')
    .setDescription("The Command you want to see help of")
    .setRequired(false)
    .setChoices({
        name: "updates command", 
        value: "updates"
    },
    {
        name: "schedule command",
        value: "schedule"
    })
)