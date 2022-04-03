import { CommandInteraction, Snowflake } from "discord.js";
import { botClient } from "../main";
import Command from "../model/Command";
import { CommandGroup } from "../model/CommandGroup";
import { CommandPermission } from "../utils";

async function leaveguild(interaction: CommandInteraction) {
    const id: Snowflake = interaction.options.getString('id', true)
    const guild = await botClient.guilds.fetch(id);
    guild.leave();
    interaction.reply(`Guild "${guild.name}" has been left`);
}

export const command = new Command(
    'leaveguild', 
    'Leaves the guild given a certain guild ID',
    CommandGroup.GENERAL,
    CommandPermission.OWNER
).addStringOption(option => option
    .setName('id')
    .setDescription('The id of the guild the bot will leave')
    .setRequired(true)
)
.setAction(leaveguild)