import {SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandStringOption} from "@discordjs/builders";
import {ChannelType} from "discord-api-types/v9";
import {ChatInputCommandInteraction, CommandInteraction} from "discord.js";
import {buildUpdateConfigsEmbed} from "../discord/embedBuilder.js";
import Command from "../model/Command.js";
import {CommandScope} from "../model/CommandGroup.js";
import {CommandPermission} from "../util/discord.js";
import {FilterModal} from "../discord/modals.js";
import UpdatesService from "../services/UpdatesService.js";
import {Logger} from "../util/log.js";

//const ACCEPTED_CHANNEL_TYPES = [
//    ChannelType.GuildNews, ChannelType.GuildNewsThread, ChannelType.GuildPrivateThread, ChannelType.GuildPublicThread, ChannelType.GuildText
//] as number[];
// Took me at least half an hour to figure out this library is not smart enough to accept that array as it is and that it must be cast to
// a number[] to be used in "addChannelTypes"
//
// Legacy workaround, issue has been fixed in @discordjs/builders 0.13.0

const CHANNEL_OPTION: SlashCommandChannelOption = new SlashCommandChannelOption()
    .setName('channel')
    .setDescription("The Channel updates should be sent into")
    .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread, ChannelType.PrivateThread, ChannelType.PublicThread, ChannelType.GuildText);

const UPDATES_CONFIG_ID_OPTION: SlashCommandIntegerOption = new SlashCommandIntegerOption()
    .setName('announcement_id')
    .setDescription("The id of the updates config you want to manage")
    .setMinValue(0)
    .setAutocomplete(true);

const TEMPLATE_MESSAGE_OPTION: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('template_message')
    .setDescription("The text Message sent together with new updates embeds (or snowflake id of the message)");


async function newtemplate(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel(CHANNEL_OPTION.name)?.id;
    const message = interaction.options.getString(TEMPLATE_MESSAGE_OPTION.name) ?? undefined;

    const config = await UpdatesService.addReportTemplate(interaction.guildId!, interaction.guild!.name, channel, message);
    await setfilters(interaction, config.id)

    void interaction.followUp(":white_check_mark: A new announcements config has been created!")
}

async function setchannel(interaction: ChatInputCommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);
    const channel = interaction.options.getChannel(CHANNEL_OPTION.name);

    try {
        await UpdatesService.editReportChannel(interaction.guildId!, configId, channel?.id);
    }
    catch (e) {
        if (e.code === 'P2018' || e.code === 'P2025') {
            void interaction.reply(`:x: Announcement config \`${configId}\` doesn't exist!`);
            return;
        }
        else throw e;
    }

    if (channel !== null)
        void interaction.reply(':white_check_mark: Scheduled projects updates will start to appear in <#' + channel.id + '> once a new project update is published!');
    else
        void interaction.reply(':white_check_mark: Scheduled updates channel has been reset.')
}

async function removetemplate(interaction: ChatInputCommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);

    try {
        await UpdatesService.removeReportTemplate(interaction.guildId!, configId);
    }
    catch (e) {
        if (e.code === 'P2018' || e.code === 'P2025') {
            void interaction.reply(`:x: Announcement config \`${configId}\` doesn't exist!`);
            return;
        }
        else throw e;
    }

    void interaction.reply(":white_check_mark: Announcements Template N°" + configId + " has been removed successfully.")

}

async function setmessage(interaction: ChatInputCommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);
    const message = interaction.options.getString(TEMPLATE_MESSAGE_OPTION.name) ?? undefined;

    try {
        await UpdatesService.editReportMessage(interaction.guildId!, configId, message)
    }
    catch (e) {
        if (e.code === 'P2018' || e.code === 'P2025') {
            void interaction.reply(`:x: Announcement config \`${configId}\` doesn't exist!`);
            return;
        }
        else throw e;
    }

    const newMessage = interaction.options.getString(TEMPLATE_MESSAGE_OPTION.name);

    if (newMessage !== null) 
        void interaction.reply(":white_check_mark: Updates-Attached Message template has been succesully edited");
    else
        void interaction.reply(":white_check_mark: Updates-Attached Message template has been reset to \"\"!");
}

async function setfilters(interaction: ChatInputCommandInteraction, externalConfigId: number | undefined = undefined) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name) ?? externalConfigId!;

    const modalWrapper = new FilterModal(interaction.guildId!, configId);

    try {
        const modal = await modalWrapper.compose();
        await interaction.showModal(modal);
        const submitted = await interaction.awaitModalSubmit({
            time: 120000,
            filter: i => i.user.id === interaction.user.id
        });

        if (submitted)
            await modalWrapper.handleSubmission(submitted);
    }
    catch (e) {
        Logger.I.error(e.message);
    }
}

async function showconfigs(interaction: CommandInteraction) {
    const settings = await UpdatesService.getAllServerUpdateConfigs(interaction.guildId!);
    const reply = await buildUpdateConfigsEmbed(settings);
    void interaction.reply({embeds: [reply]});
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
.setAutocompleteHandler(async (interaction) => {
    if (interaction.options.get(UPDATES_CONFIG_ID_OPTION.name) != null) {
        const configIds = await UpdatesService.getAllConfigIds(interaction.guildId!);
        await interaction.respond(configIds.map(index => {return { name: index.id + "", value: index.id}}));
    }
})
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
    .addIntegerOption(UPDATES_CONFIG_ID_OPTION.setRequired(true))
    .setDescription("Controls which projects will be announced depending on certain conditions")
)