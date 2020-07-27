const cf = require('mc-curseforge-api');
const { MessageEmbed } = require('discord.js');
const config = require('../cfg.json');
const embedColors = [
	'404040',
	'FEBC11',
	'F26122',
];
const releaseColors = {
	Alpha: 'ED493E',
	Beta: '0E9BD8',
	Release: '14B866',
};


class Utils {
	// cf getMod Wrapper function
	static async getModById(id) {
		return cf.getMod(id);
	}

	static createEmbed(title, description = '') {
		const embed = new MessageEmbed();

		embed.setTitle(title);

		if (description !== '') {
			embed.setDescription(description);
		}

		// Set a Random Embed Color
		embed.setColor(embedColors[Math.ceil((Math.random() * 3))]);

		return embed;
	}

	static async buildScheduleEmbed(guildId, client) {
		const idNamePairs = [];

		config.serverConfig[guildId].projects.forEach(project => {
			idNamePairs.push({ name: project.id, value: project.version });
		});

		const embed = new MessageEmbed();
		embed.color = embedColors[Math.ceil((Math.random() * 3))];
		embed.setTitle('Registered Projects and Release Channel for this server');

		const releasesChannelId = config.serverConfig[guildId].releasesChannel;

		let channel = null;
		if (releasesChannelId !== -1) {
			channel = await client.channels.fetch(releasesChannelId);
		}

		if (channel !== null) {
			embed.addField('Announcements Channel', channel.toString());
		}
		else {
			embed.addField('Announcements Channel', 'None');
		}

		if (idNamePairs.length > 0) {
			embed.addFields(idNamePairs);
		}
		else {
			embed.setTitle('No Projects have been Scheduled on this server');
		}

		return embed;
	}

	static buildModEmbed(mod, modFile) {
		const modEmbed = new MessageEmbed();
		const releaseTypeString = this.getTypeStringFromId(modFile.release_type);
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
		modEmbed.setColor(releaseColors[releaseTypeString]);
		modEmbed.setThumbnail(mod.logo.url);
		modEmbed.addField('Minecraft Versions', modFile.minecraft_versions.join(', '));
		modEmbed.addField('New Mod Version', fileName);
		modEmbed.addField('Type', releaseTypeString);
		modEmbed.addField('Links', '[Download](' + modFile.download_url.replace(/ /g, '%20') + ')\n[CurseForge](' + mod.url + ')');
		modEmbed.setTimestamp(modFile.timestamp);

		console.log('Latest file: ' + fileName);

		return modEmbed;
	}

	static async queryLatest(id) {
		const mod = await cf.getMod(id);
		const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
		const embed = this.buildModEmbed(mod, latestFile);
		return embed;
	}

	static getTypeStringFromId(typeId) {
		switch (typeId) {
		case 1:
			return 'Release';
		case 2:
			return 'Beta';
		case 3:
			return 'Alpha';
		}
	}
}

exports.Utils = Utils;