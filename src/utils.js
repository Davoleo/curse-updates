const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const config = require('./cfg.json');
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
	static savePrefix(prefix) {
		const newConfig = config;
		newConfig.prefix = prefix;

		fs.writeFile('./cfg.json', JSON.stringify(config, null, 2), function writeJSON(e) {
			if (e) {
				return console.log(e);
			}
		});
	}

	static createEmbed(description = '', title = '') {
		const embed = new MessageEmbed();

		if (title !== '') {
			embed.setTitle(title);
		}

		if (description !== '') {
			embed.setDescription(description);
		}

		// Set a Random Embed Color
		embed.setColor(embedColors[Math.ceil((Math.random() * 3))]);

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

		modEmbed.setTitle('New ' + mod.name + ' ' + releaseTypeString + '!').setURL(mod.url);
		modEmbed.setDescription(mod.summary);
		modEmbed.addField('Authors', authorString);
		modEmbed.setColor(releaseColors[releaseTypeString]);
		modEmbed.setThumbnail(mod.logo.url);
		modEmbed.addField('Minecraft Versions', modFile.minecraft_versions.join(', '));
		modEmbed.addField('New Mod Version', fileName);
		modEmbed.addField('Type', releaseTypeString);
		modEmbed.addField('Links', '[Download](' + modFile.download_url.replace(/ /g, '%20') + ')\n[CurseForge](' + mod.url + ')');
		console.log(mod.authors[0]);
		modEmbed.setTimestamp(modFile.timestamp);

		console.log(modFile);

		return modEmbed;
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