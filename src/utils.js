const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const config = require('./cfg.json');
const embedColors = [
	'404040',
	'FEBC11',
	'F26122',
];


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

}

exports.Utils = Utils;