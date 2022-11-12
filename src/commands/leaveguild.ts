import {ChatInputCommandInteraction, CommandInteraction, Snowflake} from "discord.js";
import { botClient } from "../main";
import Command from "../model/Command";
import { CommandScope } from "../model/CommandGroup";
import { CommandPermission } from "../util/discord";

async function leaveguild(interaction: ChatInputCommandInteraction) {
    const id: Snowflake = interaction.options.getString('id', true)
    const guild = await botClient.guilds.fetch(id);
    guild.leave();
    interaction.reply(`Guild "${guild.name}" has been left`);
}

export const command = new Command(
    'leaveguild', 
    'Leaves the guild given a certain guild ID',
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
).addStringOption(option => option
    .setName('id')
    .setDescription('The id of the guild the bot will leave')
    .setRequired(true)
)
.setAction(leaveguild)