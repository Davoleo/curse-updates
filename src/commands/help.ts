import {ChatInputCommandInteraction} from "discord.js";
import {buildHelpEmbed} from "../discord/embedBuilder";
import Command from "../model/Command";
import {CommandScope} from "../model/CommandGroup";
import {CommandPermission} from "../util/discord";

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
.setAction(help)