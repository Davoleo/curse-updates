import { MessageEmbed } from "discord.js";
import { CurseHelper } from "./curseHelper";
import { commands } from "./main";
import { ReleaseType, releaseTypes } from "./model/ModData";


const embedColors = [
	0x404040,
	0xFEBC11,
	0xF26122,
];

export function buildHelpEmbed(title: string, category: string): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setTitle(title);

    commands.forEach(command => {
        if (command.category === category) {
            embed.addField(command.name, command.description);
        }
    });

    if (embed.fields === []) {
        embed.setDescription("No commands found for specificed category.\nTip: write `help` without any category to get a list of general commands")
    }

    // Set a Random Embed Color
    embed.setColor(embedColors[Math.ceil((Math.random() * 3))]);
    return embed;
}

export async function buildModEmbed(modId: number): Promise<MessageEmbed> {

    const projectData = await CurseHelper.queryModById(modId);
    const mod = projectData.mod;
    const modFile = projectData.latestFile;

    const modEmbed = new MessageEmbed();
    const releaseType: ReleaseType = releaseTypes[modFile.release_type as unknown as number];
    const splitUrl = modFile.download_url.split('/');
    const fileName = splitUrl[splitUrl.length - 1];
    let authorString = '';

    for (let i = 0; i < mod.authors.length; i++) {
        const author = mod.authors[i];
        authorString += '[' + author.name + '](' + author.url + '), ';
    }

    modEmbed.type = 'rich';
    modEmbed.setTitle('New ' + mod.name + ' ' + releaseType.name + '!').setURL(mod.url);
    modEmbed.setDescription(mod.summary);
    modEmbed.addField('Authors', authorString);
    modEmbed.setColor(releaseType.color);
    modEmbed.setThumbnail(mod.logo.url);
    modEmbed.addField('Minecraft Versions', modFile.minecraft_versions.join(', '));
    modEmbed.addField('New Mod Version', fileName);
    modEmbed.addField('Type', releaseType.name);
    modEmbed.addField('Links', '[Download](' + modFile.download_url.replace(/ /g, '%20') + ')\n[CurseForge](' + mod.url + ')');
    modEmbed.setTimestamp(modFile.timestamp);

    console.log('Latest file: ' + fileName);

    return modEmbed;
}