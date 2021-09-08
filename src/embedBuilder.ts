import { MessageEmbed } from "discord.js";
import { commands, logger } from "./main";
import ModData, { ReleaseType, releaseTypes } from "./model/ModData";
import { Utils } from "./utils";

export const embedColors = [
	0x404040,
	0xFEBC11,
	0xF26122,
];

export function buildHelpEmbed(title: string, category: string): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setTitle(title);

    if (category === 'general') {
        category = '';
    }

    commands.forEach(command => {
        if (command.category === category) {

            let argString = '';
            if (command.argNames.length > 0)
                command.argNames.forEach(arg => argString += (" `" + arg + "`"));

            embed.addField(category + ' ' +  command.name + argString, command.description);
        }
    });

    if (embed.fields.length === 0) {
        embed.setDescription("No commands found for specified category.\nTip: write `help` with any of the categories listed below to get a list of commands!");
        embed.addField("Categories: ", "`general`\n`schedule`")
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

    let releaseType: ReleaseType;
    if (modFile.release_type == undefined) {
        releaseType = releaseTypes[0];
    }
    else {
        releaseType = releaseTypes[modFile.release_type as unknown as number];
    }

    const fileName = Utils.getFilenameFromURL(modFile.download_url);
    let authorString = '';

    for (let i = 0; i < mod.authors.length; i++) {
        const author = mod.authors[i];

        authorString += '[' + author.name + '](' + author.url + ')' + (i == mod.authors.length - 1 ? '; ' : ', ');
    }

    let fileSize = Number(modFile.file_size)
    let fileSizeString = fileSize + "B"
    fileSize /= 1000;
    if (fileSize > 0) {
        fileSizeString = fileSize.toFixed(2) + "KB";
    }
    fileSize /= 1000;
    if (fileSize > 0) {
        fileSizeString = fileSize.toFixed(2) + "MB";
    }

    const downloadString = new Intl.NumberFormat('en-US').format(mod.downloads);

    modEmbed.setTitle('New ' + mod.name + ' ' + releaseType.name + '!').setURL(mod.url);
    modEmbed.setDescription(mod.summary + '\n━━━━━━━\n**Total Downloads**: ' + downloadString + "\n**Authors**: " + authorString);
    modEmbed.setColor(releaseType.color);
    modEmbed.setThumbnail(mod.logo?.url);
    modEmbed.addField('New Version File', fileName, true);
    modEmbed.addField('Size', fileSizeString, true);
    modEmbed.addField('Type', releaseType.name);
    modEmbed.addField('Minecraft Versions', modFile.minecraft_versions.join(', '));
    modEmbed.addField('Links', '[Download](' + modFile.download_url.replace(/ /g, '%20') + ')\t|\t[Changelog](' + mod.url + '/files/' + modFile.id + ')\t|\t[Project](' + mod.url + ')');
    modEmbed.setTimestamp(modFile.timestamp);

    logger.info('Latest file: ' + fileName);

    return modEmbed;
}