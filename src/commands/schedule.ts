import {ChatInputCommandInteraction, CommandInteraction} from "discord.js";
import {buildScheduleEmbed} from "../discord/embedBuilder";
import Command from "../model/Command";
import {CommandScope} from "../model/CommandGroup";
import {CommandPermission} from "../util/discord";
import GuildService from "../services/GuildService";
import {ErrorNotFound} from "node-curseforge/dist/objects/exceptions";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";

const PROJECT_ID_KEY = 'project_id'

async function add(interaction: ChatInputCommandInteraction) {

    const projectID = interaction.options.getInteger(PROJECT_ID_KEY, true);
    
    try {
        const serverId = interaction.guildId!;
        const slug = await GuildService.addProject(serverId, projectID)
        void interaction.reply(":white_check_mark: " + slug + " has been successfully added to the schedule");
    }
    catch(error) {
        if (error instanceof ErrorNotFound) {
            void interaction.reply({content: `:x: Error: ${error.message} ID=${projectID}`, ephemeral: true});
        }
        else if (error instanceof Error) {
            void interaction.reply({content: `:x: ${error.name} Error: ${error.message}`, ephemeral: true});
        }
        else {
            void interaction.reply({content: `:x: ${error.name}!`, ephemeral: true});
            throw error;
        }
    }
}

async function remove(interaction: ChatInputCommandInteraction) {
    
    const projectID = interaction.options.getInteger(PROJECT_ID_KEY, true);

    try {
        //Remove project from the schedule
        await GuildService.removeProject(interaction.guildId!, projectID);
        await interaction.reply(":recycle: Project `(ID: " + projectID + ")` removed successfully!");
    }
    catch(error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2018' || error.code === 'P2025') {
                void interaction.reply(":x: Couldn't find a project with `ID = " + projectID + "` in the bot schedule")
            }
        }
        else throw error;
    }
}

async function show(interaction: CommandInteraction) {
    const embeds = await buildScheduleEmbed(interaction.guildId!);
    void interaction.reply({embeds: embeds});
}

async function clear(interaction: CommandInteraction) {
    try {
        await GuildService.clearProjects(interaction.guildId!);
        void interaction.reply(':warning: Schedule was cleared successfully!');
    }
    catch (e) {
        if (e instanceof Error) {
            void interaction.reply(":x: Can't clear Schedule: " + e.message)
        }
        else throw e;
    }
}

export const command = new Command(
    'schedule',
    "Management of current server's scheduled projects",
    CommandScope.SERVER,
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
    .setDescription("Shows current server's update schedule and designated announcements channel")
)
.addSubcommand(subcommand => subcommand
    .setName(clear.name)
    .setDescription("Removes all Curseforge projects from the scheduled check that runs once every 15 minutes")
)