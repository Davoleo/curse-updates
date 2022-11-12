import {ChatInputCommandInteraction, CommandInteraction} from "discord.js";
import { CurseHelper } from "../curseHelper";
import CacheManager from "../data/CacheManager";
import { DBHelper } from "../data/dataHandler";
import ServerManager from "../data/ServerManager";
import { buildScheduleEmbed } from "../embedBuilder";
import { logger } from "../main";
import Command from "../model/Command";
import { CommandScope } from "../model/CommandGroup";
import { CommandPermission } from "../util/discord";

const PROJECT_ID_KEY = 'project_id'

async function add(interaction: ChatInputCommandInteraction) {

    const projectID = interaction.options.getInteger(PROJECT_ID_KEY, true);
    
    try {
        const data = await CurseHelper.queryModById(projectID);
        const serverId = interaction.guildId!;

        const serverManager = await ServerManager.ofServer(serverId) ?? ServerManager.create(serverId, interaction.guild!.name);
        await serverManager.querySchedule();
        serverManager.addProject(projectID);

        //Transaction
        serverManager.save();
        CacheManager.addProject(serverId, data.mod.id, data.mod.slug, data.latestFile.fileName);
        DBHelper.runTransaction(serverId);

        interaction.reply(":white_check_mark: " + data.mod.name + " has been successfully added to the schedule");
    }
    catch(error) {
        if (error instanceof Error)
            interaction.reply({content: `:x: ${error.name} Error: ${error.message}`, ephemeral: true});
        else
            interaction.reply({content: ":x: UNKNOWN ERROR!", ephemeral: true});
    }
}

async function remove(interaction: ChatInputCommandInteraction) {
    
    const projectID = interaction.options.getInteger(PROJECT_ID_KEY, true);
    const serverManager = await ServerManager.ofServer(interaction.guildId!);

    if (serverManager === null) 
    {
        interaction.reply(":x: Can't remove projects from a server with empty schedule!");
        return;
    }

    try {
        //Remove project from the schedule
        serverManager.removeProject(projectID);
        //Save to DB and Run a check to see if the project still needs to be in the cache
        
        serverManager.save()
        CacheManager.cleanupProject(serverManager.serverId, projectID);
        DBHelper.runTransaction(serverManager.serverId);

        interaction.reply(":recycle: Project `(ID: " + projectID + ")` removed successfully!");
    }
    catch(error) {
        interaction.reply(":x: Couldn't find a project with `ID = " + projectID + "` in the bot schedule");
    }
}

async function show(interaction: CommandInteraction) {
    const serverManager = await ServerManager.ofServer(interaction.guildId!);

    if (serverManager === null) {
        interaction.reply("This server is not registered in the Database");
        return;
    }

    const embeds = await buildScheduleEmbed(serverManager);
    interaction.reply({embeds: embeds});
}

async function clear(interaction: CommandInteraction) {
    const manager = await ServerManager.ofServer(interaction.guildId!);

    if (manager === null) {
        interaction.reply(":x: Can't clear schedule of a server that already has empty schedule.");
        return;
    }

    await manager.querySchedule();

    manager.clearProjects();
    manager.save();

    for (const proj of manager.projects) {
        CacheManager.cleanupProject(manager.serverId, proj);
    }

    DBHelper.runTransaction(manager.serverId);

    interaction.reply(':warning: Schedule was cleared successfully!');
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