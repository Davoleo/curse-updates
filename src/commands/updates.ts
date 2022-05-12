import { SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandStringOption } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";
import { CurseHelper } from "../curseHelper";
import ServerManager from "../data/ServerManager";
import UpdatesManager from "../data/UpdatesManager";
import Command from "../model/Command";
import { CommandScope } from "../model/CommandGroup";
import { CommandPermission } from "../util/discord";

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
    .addChannelTypes(ChannelType.GuildNews, ChannelType.GuildNewsThread, ChannelType.GuildPrivateThread, ChannelType.GuildPublicThread, ChannelType.GuildText);

const UPDATES_CONFIG_ID_OPTION: SlashCommandIntegerOption = new SlashCommandIntegerOption()
    .setName('announcement_id')
    .setDescription("The id of the updates config you want to manage")
    .setMinValue(0);

const TEMPLATE_MESSAGE_OPTION: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('template_message')
    .setDescription("The text Message sent together with new updates embeds (or snowflake id of the message)");

const GAME_VERSIONS_FILTER_OPTION: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('game_versions')
    .setDescription("Game versions whitelist in this format: `VER1|VER2|..` (Empty Option means all included)");
    
const PROJECTS_FILTER_OPTION: SlashCommandStringOption = new SlashCommandStringOption()
    .setName('projects_whitelist')
    .setDescription("Project Ids whitelist in this format: `PROJ1|PROJ2|..` (Empty Option means all included)")


async function newtemplate(interaction: CommandInteraction) {
    const channel = interaction.options.getChannel(CHANNEL_OPTION.name);
    const newMessage = interaction.options.getString(TEMPLATE_MESSAGE_OPTION.name);

    const settings = await UpdatesManager.ofServer(interaction.guildId!);
    settings.addReportTemplate(channel?.id, newMessage !== null ? newMessage : undefined)
    await settings.save();
}

async function setchannel(interaction: CommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);
    const channel = interaction.options.getChannel(CHANNEL_OPTION.name);

    //non-guild scopes are excluded before -> guildId is not null
    const settings = await UpdatesManager.ofServer(interaction.guildId!);

    if (settings.isTemplateInvalid(configId)) {
        interaction.reply(":x: That Announcement Template doesn't exist!");
        return;
    }

    settings.editReportChannel(configId, channel?.id)
    await settings.save();
    if (channel !== null)
        interaction.reply(':white_check_mark: Scheduled projects updates will start to appear in <#' + channel.id + '> once a new project update is published!');
    else
        interaction.reply(':white_check_mark: Scheduled updates channel has been reset.')
}

async function removetemplate(interaction: CommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);

    //non-guild scopes are excluded before -> guildId is not null
    const settings = await UpdatesManager.ofServer(interaction.guildId!);

    if (settings.isTemplateInvalid(configId)) {
        interaction.reply(":x: That Announcement Template doesn't exist!");
        return;
    }

    settings.removeReportTemplate(configId);
    await settings.save();
    interaction.reply(":white_check_mark: Announcements Template N°" + configId + " has been removed successfully.")

}

async function setmessage(interaction: CommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);

    //non-guild scopes are excluded before -> guildId is not null
    const settings = await UpdatesManager.ofServer(interaction.guildId!);

    if (settings.isTemplateInvalid(configId)) {
        interaction.reply(":x: That Announcement Template doesn't exist!");
        return;
    }

    const newMessage = interaction.options.getString(TEMPLATE_MESSAGE_OPTION.name);
    settings.editReportMessage(configId, newMessage ?? undefined);

    await settings.save();

    if (newMessage !== null) 
        interaction.reply(":white_check_mark: Updates-Attached Message template has been succesully edited");
    else
        interaction.reply(":white_check_mark: Updates-Attached Message template has been reset to \"\"!");
}

async function setfilters(interaction: CommandInteraction) {
    const configId = interaction.options.getInteger(UPDATES_CONFIG_ID_OPTION.name, true);
    const gameVerString = interaction.options.getString(GAME_VERSIONS_FILTER_OPTION.name);
    const projectString = interaction.options.getString(PROJECTS_FILTER_OPTION.name);

    const settings = await UpdatesManager.ofServer(interaction.guildId!);

    const gameVers = gameVerString?.split('|');
    if (gameVers !== undefined) {
        for (const ver of gameVers) {
            let found = false;
            //TODO Implement Game-specific game version filtering in the format of ("game:version")
            CurseHelper.gameVersions.forEach((versions) => { 
                if (versions.has(ver)) {
                    found = true;
                    return;
                }
            });

            if (!found) {
                interaction.reply(":x: Game Versions filter format is invalid, please fix try again.");
                return;
            }
        }
    }
    settings.setGameVersionFilter(configId, gameVers);

    const projects = projectString?.split('|');
    if (projects !== undefined) {

        const serverConfig = (await ServerManager.ofServer(interaction.guildId!))!;
        await serverConfig.querySchedule();
        
        for (const proj of projects) {
            const projId = Number(proj);
            if (Number.isNaN(projId)) {
                interaction.reply(":x: One of the project Ids in the whitelist filter is malformed, please fix and try again.");
                return;
            }
            if (!serverConfig.projects.has(projId)) {
                interaction.reply(":x: One of the project Ids in the whitelist filter is not part of this server's scheduled projects, either add it or remove it from the whitelist.")
                return;
            }
        }
    }
    settings.setProjectsFilter(configId, gameVers);

    settings.save();

    interaction.reply(":white_check_mark: Announcement Filters edited succesfully!\n" +
    "Game Version Filter: " + (gameVers !== undefined ? 'set' : 'reset') + " to `" + gameVerString + '`\n' +
    "Projects Filter: " + (projects !== undefined ? 'set' : 'reset') + " to `" + projectString + '`');
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