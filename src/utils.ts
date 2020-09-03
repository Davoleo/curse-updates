import * as cf from 'mc-curseforge-api';
import { MessageEmbed, Snowflake, Client, EmbedFieldData } from 'discord.js';
import * as configJson from './cfg.json';
import { BotConfig } from './model/BotConfig';
import { Mod } from '../typings/mc-curseforge-api/objects/Mod';
import { ModFile } from '../typings/mc-curseforge-api/objects/Files';

const config: BotConfig = Object.assign(configJson);
const embedColors = [
	0x404040,
	0xFEBC11,
	0xF26122,
];

type Release = 'Alpha' | 'Beta' | "Release";

const releaseColors = new Map<Release, number>();
releaseColors.set('Alpha', 0xED493E)
releaseColors.set('Beta', 0x0E9BD8);
releaseColors.set('Release', 0x14B866);


export class Utils {
	// cf getMod Wrapper function
	static async getModById(id: number): Promise<Mod> {
		return cf.getMod(id);
	}

	static createEmbed(title: string, description = ''): MessageEmbed {
		const embed = new MessageEmbed();

		embed.setTitle(title);

		if (description !== '') {
			embed.setDescription(description);
		}

		// Set a Random Embed Color
		embed.setColor(embedColors[Math.ceil((Math.random() * 3))]);

		return embed;
	}

	static async buildScheduleEmbed(guildId: Snowflake, client: Client): Promise<MessageEmbed> {
		const idNamePairs: EmbedFieldData[] = [];

		config.serverConfig[guildId].projects.forEach(project => {
			idNamePairs.push({name: project.id, value: project.version});
		});

		const embed = new MessageEmbed();
		embed.color = embedColors[Math.ceil((Math.random() * 3))];
		embed.setTitle('Registered Projects and Release Channel for this server');

		const releasesChannelId = config.serverConfig[guildId].releasesChannel;

		let channel = null;
		if (releasesChannelId !== '-1') {
			channel = await client.channels.fetch(releasesChannelId);
		}

		if (channel !== null) {
			embed.addField('Announcements Channel', channel.toString());
		}
		else {
			embed.addField('Announcements Channel', 'None');
		}

		const messageTemplate = config.serverConfig[guildId].messageTemplate;
		if (messageTemplate !== '') {
			embed.addField('Template Message', messageTemplate);
		}
		else {
			embed.addField('Template Messsage', 'None');
		}

		if (idNamePairs.length > 0) {
			embed.addFields(idNamePairs);
		}
		else {
			embed.setTitle('No Projects have been Scheduled on this server');
		}

		return embed;
	}

	static buildModEmbed(mod: Mod, modFile: ModFile): MessageEmbed {
		const modEmbed = new MessageEmbed();
		const releaseTypeString: Release = this.getTypeStringFromId(modFile.release_type as unknown as number);
		const splitUrl = modFile.download_url.split('/');
		const fileName = splitUrl[splitUrl.length - 1];
		let authorString = '';

		for (let i = 0; i < mod.authors.length; i++) {
			const author = mod.authors[i];
			authorString += '[' + author.name + '](' + author.url + '), ';
		}

		modEmbed.type = 'rich';
		modEmbed.setTitle('New ' + mod.name + ' ' + releaseTypeString + '!').setURL(mod.url);
		modEmbed.setDescription(mod.summary);
		modEmbed.addField('Authors', authorString);
		modEmbed.setColor(releaseColors.get(releaseTypeString));
		modEmbed.setThumbnail(mod.logo.url);
		modEmbed.addField('Minecraft Versions', modFile.minecraft_versions.join(', '));
		modEmbed.addField('New Mod Version', fileName);
		modEmbed.addField('Type', releaseTypeString);
		modEmbed.addField('Links', '[Download](' + modFile.download_url.replace(/ /g, '%20') + ')\n[CurseForge](' + mod.url + ')');
		modEmbed.setTimestamp(modFile.timestamp);

		console.log('Latest file: ' + fileName);

		return modEmbed;
	}

	static async queryLatest(id: number): Promise<MessageEmbed> {
		const mod = await cf.getMod(id);
		const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
		const embed = this.buildModEmbed(mod, latestFile);
		return embed;
	}

	static getTypeStringFromId(typeId: number): Release {
		switch (typeId) {
		case 1:
			return 'Release';
		case 2:
			return 'Beta';
		case 3:
			return 'Alpha';
		}
		return null;
	}

	static sendDMtoDavoleo(client: Client, message: string): void {
		client.users.fetch('143127230866915328')
			.then((davoleo) => davoleo.send(message));
	}
}

exports.Utils = Utils;