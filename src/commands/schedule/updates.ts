import { SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandStringOption } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";
import UpdatesManager from "../../data/UpdatesManager";
import Command from "../../model/Command";
import { CommandScope } from "../../model/CommandGroup";
import { CommandPermission } from "../../utils";

const ACCEPTED_CHANNEL_TYPES = [
    ChannelType.GuildNews, ChannelType.GuildNewsThread, ChannelType.GuildPrivateThread, ChannelType.GuildPublicThread, ChannelType.GuildText
] as number[];
// Took me at least half an hour to figure out this library is not smart enough to accept that array as it is and that it must be cast to
// a number[] to be used in "addChannelTypes"

const CHANNEL_OPTION: SlashCommandChannelOption = new SlashCommandChannelOption()
    .setName('channel')
    .setDescription("The Channel updates should be sent into")
    .addChannelTypes(ACCEPTED_CHANNEL_TYPES);

const UPDATES_CONFIG_ID_OPTION: SlashCommandIntegerOption = new SlashCommandIntegerOption()
    .setName('announcement id')
    .setDescription("The id of the updates config you want to manage")
    .setMinValue(0);

const TEMPLATE_MESSAGE_OPTION: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('template message')
    .setDescription("The text Message sent together with new updates embeds (or snowflake id of the message)");

const GAME_VERSIONS_FILTER_OPTION: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('game versions')
    .setDescription("Game versions whitelist in this format: `VER1|VER2|..` (Empty Option means all included)");
    
const PROJECTS_FILTER_OPTION: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('projects whitelist')
    .setDescription("Project Ids whitelist in this format: `ID1|ID2|..` (Empty Option means all included)")

async function newtemplate(interaction: CommandInteraction) {
    //TODO Implement
}

async function setchannel(interaction: CommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);
    const channel = interaction.options.getChannel(CHANNEL_OPTION.name);

    const settings = await UpdatesManager.ofServer(interaction.guildId!);

    settings.editReportChannel(configId, channel?.id)
    if (channel !== null)
        interaction.reply(':white_check_mark: Scheduled projects updates will start to appear in <#' + channel.id + '> once a new project update is published!');
    else
        interaction.reply(':white_check_mark: Scheduled updates has been reset.')
}

async function removetemplate(interaction: CommandInteraction) {
    //TODO Implement
}

async function setmessage(interaction: CommandInteraction) {
    //TODO Implement
}

async function setfilters(interaction: CommandInteraction) {
    //TODO Implement
}

async function showconfigs(interaction: CommandInteraction) {
    //TODO Implement
}

export const command = new Command(
    'updates',
    "Management of the current server's updates announcements settings",
    CommandScope.SERVER,
    CommandPermission.MODERATOR
)
.setAction(newtemplate, newtemplate.name)
.setAction(removetemplate, removetemplate.name)
.setAction(showconfigs, showconfigs.name)
.setAction(setchannel, setchannel.name)
.setAction(setmessage, setmessage.name)
.setAction(setfilters, setfilters.name)
.addSubcommand(subcommand => subcommand
    .setName(newtemplate.name)
    .setDescription("Adds a new Announcements Config to the current server")
    .addChannelOption(CHANNEL_OPTION)
    .addStringOption(TEMPLATE_MESSAGE_OPTION)
)
.addSubcommand(subcommand => subcommand
    .setName(removetemplate.name)
    .setDescription("Removes an announcement config given its identifier")
    .addIntegerOption(UPDATES_CONFIG_ID_OPTION.setRequired(true))
)
.addSubcommand(subcommand => subcommand
    .setName(showconfigs.name)
    .setDescription("Shows the current updates configuration setup")
)
.addSubcommand(subcommand => subcommand
    .setName(setchannel.name)
    .setDescription("Sets announcements channel for a certain updates config (null channel option disables the config)")
    .addIntegerOption(UPDATES_CONFIG_ID_OPTION.setRequired(true))
    .addChannelOption(CHANNEL_OPTION)
)
.addSubcommand(subcommand => subcommand
    .setName(setmessage.name)
    .setDescription("Sets the message attached to every release (can contain mentions, null message disables the feature)")
    .addIntegerOption(UPDATES_CONFIG_ID_OPTION.setRequired(true))
    .addStringOption(TEMPLATE_MESSAGE_OPTION)
)
.addSubcommand(subcommand => subcommand
    .setName(setfilters.name)
    .setDescription("Controls which projects will be announced depending on certain conditions")
    .addStringOption(GAME_VERSIONS_FILTER_OPTION)
    .addStringOption(PROJECTS_FILTER_OPTION)
)