import {AnnouncementsConfig} from "@prisma/client";
import {APIEmbedField, EmbedBuilder, EmbedField, Snowflake} from "discord.js";
import {FileReleaseType} from "node-curseforge/dist/objects/enums.js";
import {commandsMap} from "../main.js";
import ModData, {RELEASE_COLORS} from "../model/ModData.js";
import GuildService from "../services/GuildService.js";

const embedColors = [
	0x404040,
	0xFEBC11,
	0xF26122,
];

function setRandomEmbedColor(embed: EmbedBuilder) {
    const index = Math.floor(Math.random() * 3);
    embed.setColor(embedColors[index]);
}


export function buildHelpEmbed(commandName = ""): EmbedBuilder {

    const embed = new EmbedBuilder();
    embed.setTitle(commandName === "" ? "Showing Help for All commands" : `Showing Help for \`${commandName}\` subcommands`);

    if (commandName !== "") {
        const subcommands = commandsMap.get(commandName)?.getSubCommands().map(com => { return { name: com.name, value: com.description};});
        if (subcommands === undefined || subcommands.length === 0)
            embed.setDescription("This command doesn't exist or doesn't have any subcommands!");
        else
            embed.setFields(subcommands);
    }
    else {
        const fields: APIEmbedField[] = [];
        commandsMap.forEach(command => fields.push({name: command.name, value: command.description}));
        embed.setFields(fields);
    }

    setRandomEmbedColor(embed);
    return embed;
}

export function buildModEmbed(projectData: ModData): EmbedBuilder {

    const mod = projectData.mod;
    const modFile = projectData.latestFile;

    const modEmbed = new EmbedBuilder();

    if (modFile == undefined || mod == undefined) {
        throw `ERROR: Querying of mod **${mod?.name}** resulted in \`undefined\` data!
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

    const wikiLink = mod.links.wikiUrl?.length > 0 ? '|\t[Wiki](' + mod.links.wikiUrl + ')\t' : '';
    const sourceLink = mod.links.sourceUrl?.length > 0 ? '|\t[Source Code](' + mod.links.sourceUrl + ')' : '';

    const fields: APIEmbedField[] = [
        {
            name: 'New Version File',
            value: modFile.fileName,
            inline: true
        },
        {
            name: 'Size',
            value: fileSizeString,
            inline: true
        },
        {
            name: 'Type',
            value: FileReleaseType[modFile.releaseType],
        },
        {
            name: 'File Tags',
            value: `[${modFile.gameVersions.join(', ')}]`,
        },
        {
            name: 'Links',
            value: '[Download](' + encodeURI(modFile.downloadUrl) +
                ')\t' + wikiLink + '|\t[Project](' + mod.links.websiteUrl +
                ')\t' + sourceLink,
        }
    ]
    modEmbed.setFields(fields);
    modEmbed.setTimestamp(new Date(modFile.fileDate));

    //logger.info('Latest file: ' + fileName);

    return modEmbed;
}

export async function buildScheduleEmbed(serverId: Snowflake): Promise<EmbedBuilder[]> {
    const embeds = [new EmbedBuilder()];
    const serverConfig = await GuildService.getAllProjects(serverId);

    const mainEmbedPairs: EmbedField[] = [];
    for (const project of serverConfig.projects) {
        mainEmbedPairs.push({
            name: project.slug,
            value: 'id: ' + (project.id) + '\nlatest cached version: ' + (project.filename),
            inline: false
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
        const extraEmbed = new EmbedBuilder();
        extraEmbed.setTitle("Scheduled Projects Page 2")
        extraEmbed.addFields(mainEmbedPairs.slice(25));

        embeds.push(extraEmbed);
    }

    //Set Embed Colors
    embeds.forEach(embed => setRandomEmbedColor(embed))

    return embeds;
}


export async function buildUpdateConfigsEmbed(updatesConfigs: AnnouncementsConfig[]): Promise<EmbedBuilder> {

    const embed = new EmbedBuilder();
    embed.setTitle("Server's Announcements Configurations")

    for (const config of updatesConfigs) {
        if (config === null)
            continue;

        const fields: APIEmbedField[] = [
            {
                name: 'Announcement Channel',
                value: config.channel ? `<#${config.channel}>` : '`None`',
                inline: false
            },
            {
                name: 'Template Message',
                value: config.message ?? '`None`',
                inline: true
            },
            {
                name: 'File Tags Filter',
                value: config.tagsFilter ?? '`Empty`',
                inline: true
            },
            {
                name: 'Projects Whitelist',
                value: config.projectsFilter ?? '`Disabled`',
                inline: true
            }
        ]
        embed.addFields(fields);
    }


    setRandomEmbedColor(embed);
    return embed;
}
