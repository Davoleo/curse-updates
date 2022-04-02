import { CommandInteraction } from "discord.js";
import Command from "../../model/Command";
import { CommandGroup } from "../../model/CommandGroup";
import { CommandPermission } from "../../utils";

const PROJECT_ID_KEY = 'project id'

async function add(interaction: CommandInteraction) {

    const projectID = interaction.options.getInteger(PROJECT_ID_KEY, true);
    
    try {
        const data = await CurseHelper.queryModById(projectID);
        const filename = Utils.getFilenameFromURL(data.latestFile.download_url);
        if (data.mod.key == undefined)
            throw Error("NULL_slug!")

        GuildHandler.addProjectToSchedule(interaction.guildId, projectID);
        CacheHandler.addProjectToCache(projectID, data.mod.key, filename, interaction.guildId, true);

        return ":white_check_mark: " + data.mod.name + " has been successfully added to the schedule";
    }
    catch(error) {
        if (error.message === "NULL_slug!")
            return ":x: The project corresponding to that ID doesn't exist or can't be fetched";
        else if (error.message === "Too_Many_Projects")
            return ":x: You have reached the project number limit for this guild, please remove some";
        else if (error.message === "Project_Already_Scheduled")
            return ":x: This project was already added to this server's schedule";
        else
            return `:x: Unexpected Error: ${error.message}!`;
    }
}

function remove(interaction: CommandInteraction) {
    
    const projectID = interaction.options.getInteger(PROJECT_ID_KEY, true);
    const wasRemoved = GuildHandler.removeProjectFromSchedule(interaction.guildId, projectID);
    
    if (wasRemoved) {
        CacheHandler.removeProjectById(interaction.guildId, projectID);
        return ":recycle: Project removed successfully!"
    }
    else
        return ":x: Couldn't find a project with that ID in the bot schedule"
}

function show(interaction: CommandInteraction) {
    const embeds = buildScheduleEmbed(interaction.guildId)

    if (embeds.extras === null) {
        return embeds.main;
    }
    else {
        interaction.reply("Not Yet Implemented!!" /*embeds.main*/)
        return embeds.extras;
    }
}

function clear(interaction: CommandInteraction) {
    const projectIDs = GuildHandler.getServerConfig(interaction.guildId).projectIds;
    GuildHandler.clearProjectsSchedule(interaction.guildId);
    CacheHandler.removeAllByGuild(interaction.guildId, projectIDs);
    return ':warning: Schedule was cleared successfully!';
}

export const command = new Command(
    'schedule',
    "Allows management of the current server's update schedule",
    CommandGroup.SCHEDULE,
    CommandPermission.MODERATOR
)
.setAction(add, add.name)
.setAction(remove, remove.name)
.setAction(show, show.name)
.setAction(clear, clear.name)
.addSubcommand(subcommand => subcommand
    .setName(add.name)
    .setDescription("Adds a Curseforge project to the scheduled check that runs once every 15 minutes")
    .addIntegerOption(option => option
        .setName(PROJECT_ID_KEY)
        .setDescription("The Id of the CurseForge Project to add to the schedule")
        .setMinValue(1)
        .setRequired(true)
    )
)
.addSubcommand(subcommand => subcommand
    .setName(remove.name)
    .setDescription("Removes a Curseforge project from the scheduled check that runs once every 15 minutes")
    .addIntegerOption(option => option
        .setName(remove.name)
        .setDescription("The Id of the CurseForge Project to remove from the schedule")
    )
)
.addSubcommand(subcommand => subcommand
    .setName(show.name)
    .setDescription("Shows the scheduled project updates announcements of the current server and the announcements channel")
)
.addSubcommand(subcommand => subcommand
    .setName(clear.name)
    .setDescription("Removes all Curseforge projects from the scheduled check that runs once every 15 minutes")
)