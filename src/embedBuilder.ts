import { EmbedFieldData, MessageEmbed } from "discord.js";
import { FileReleaseType } from "node-curseforge/dist/objects/enums";
import CacheManager from "./data/CacheManager";
import ServerManager from "./data/ServerManager";
import UpdatesManager from "./data/UpdatesManager";
import { commandsMap } from "./main";
import ModData, { RELEASE_COLORS } from "./model/ModData";

export const embedColors = [
	0x404040,
	0xFEBC11,
	0xF26122,
];

export function buildHelpEmbed(commandName = ""): MessageEmbed {

    const embed = new MessageEmbed();
    embed.setTitle(commandName === "" ? "Showing Help for All commands" : `Showing Help for \`${commandName}\` subcommands`);

    if (commandName !== "") {
        const subcommands = commandsMap.get(commandName)?.getSubCommands();
        if (subcommands === undefined || subcommands.length === 0)
            embed.setDescription("This command doesn't exist or doesn't have any subcommands!");
        else
            subcommands.forEach(subcommand => embed.addField(subcommand.name, subcommand.description))
    }
    else {
        commandsMap.forEach(command => embed.addField(command.name, command.description));
    }

    // Set a Random Embed Color
    embed.setColor(embedColors[Math.ceil((Math.random() * 3))]);
    return embed;
}

export function buildModEmbed(projectData: ModData): MessageEmbed {

    const mod = projectData.mod;
    const modFile = projectData.latestFile;

    const modEmbed = new MessageEmbed();

    if (modFile == undefined || mod == undefined) {
        throw `ERROR: Querying the latest file of **${mod.name}** resulted in an \`undefined\` file!
        Note: This error is most likely caused by trying to query an unsupported CF Project
        Note: If this error persists and is thrown in a scheduled update check please remove the project from the bot schedule.`
    }

    const releaseColor = modFile.releaseType != null ? RELEASE_COLORS[modFile.releaseType] : RELEASE_COLORS[0];

    let authorString = '';
    for (let i = 0; i < mod.authors.length; i++) {
        const author = mod.authors[i];
        authorString += '[' + author.name + '](' + author.url + ')' + (i == mod.authors.length - 1 ? '; ' : ', ');
    }

    //Precision might go "not stonks" here but whatever :D
    let fileSize = Number(modFile.fileLength);
    let fileSizeString = fileSize + "B"
    fileSize /= 1000;
    if (fileSize > 0) {
        fileSizeString = fileSize.toFixed(2) + "KB";
    }
    fileSize /= 1000;
    if (fileSize > 0) {
        fileSizeString = fileSize.toFixed(2) + "MB";
    }

    const downloadString = new Intl.NumberFormat('en-US').format(mod.downloadCount);

    modEmbed.setTitle('New ' + mod.name + ' ' + FileReleaseType[modFile.releaseType] + '!').setURL(mod.links.websiteUrl);
    modEmbed.setDescription(mod.summary + '\n━━━━━━━\n**Total Downloads**: ' + downloadString + "\n**Authors**: " + authorString);
    modEmbed.setColor(releaseColor);
    modEmbed.setThumbnail(mod.logo.url);
    modEmbed.addField('New Version File', modFile.fileName, true);
    modEmbed.addField('Size', fileSizeString, true);
    modEmbed.addField('Type', FileReleaseType[modFile.releaseType]);
    modEmbed.addField('Game Versions', '[' + modFile.gameVersions.join(', ') + ']');
    modEmbed.addField('Links', '[Download](' + modFile.downloadUrl.replace(/ /g, '%20') + ')\t|\t[Wiki](' + mod.links.wikiUrl + ')\t|\t[Project](' + mod.links.websiteUrl + ')\t|\t[Source Code](' + mod.links.sourceUrl + ')');
    modEmbed.setTimestamp(modFile.fileDate);

    //logger.info('Latest file: ' + fileName);

    return modEmbed;
}

export async function buildScheduleEmbed(serverConfig: ServerManager): Promise<MessageEmbed[]> {
    const embeds = [new MessageEmbed()];

    await serverConfig.querySchedule();

    const mainEmbedPairs: EmbedFieldData[] = [];
    for (const id of serverConfig.projects) {
        const project = await CacheManager.getCachedProject(id);
        mainEmbedPairs.push({
            name: project?.slug ?? 'null',
            value: 'id: ' + (project?.id ?? 'null') + '\nlatest cached version: ' + (project?.version ?? 'null')
        });
    }

    if (mainEmbedPairs.length > 0) {
        embeds[0].setTitle(serverConfig.serverName + '\'s Registered Projects');
        embeds[0].addFields(mainEmbedPairs);
    }
    else {
        embeds[0].setTitle('No Projects have been Scheduled on ' + serverConfig.serverName);
        return embeds;
    }
    
    //Discord Embed Field Limit is currently 25 so if the mod entries fields are over 23 we build a second embed containing the remaining projects
    if (mainEmbedPairs.length > 25) {
        const extraEmbed = new MessageEmbed();
        extraEmbed.setTitle("Scheduled Projects Page 2")
        extraEmbed.addFields(mainEmbedPairs.slice(25));

        embeds.push(extraEmbed);
    }

    //Set Embed Colors
    const embColor = embedColors[Math.ceil((Math.random() * 3))]
    embeds.forEach(embed => embed.color = embColor)

    return embeds;
}


export async function buildUpdateConfigsEmbed(updatesManager: UpdatesManager): Promise<MessageEmbed> {
    const embed = new MessageEmbed();

    embed.setTitle("Server's Announcements Configurations")

    for (const config of updatesManager.config) {
        if (config === null)
            continue;
        embed.addField("Announcement Channel", config.channel ? `<#${config.channel}>` : '`None`', false);
        embed.addField("Template Message", config.message ?? '`None`', true);
        embed.addField("Game Versions Filter", config.gameVerFilter ?? '`Empty`', true);
        embed.addField("Projects Whitelist", config.projectsFilter ?? '`Disabled`', true);
    }


    embed.setColor(embedColors[Math.ceil((Math.random() * 3))]);
    return embed;
}
