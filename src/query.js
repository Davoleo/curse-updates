const { Utils } = require('./utils');

const cf = require('mc-curseforge-api');

class CFQuery {

	static queryLatest(message, id) {
		cf.getMod(id).then((mod) => {
			const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
			const embed = Utils.buildModEmbed(mod, latestFile);
			message.channel.send(embed);
		},
		(error) => {
			message.channel.send('Error: ' + error + '!');
		});
	}
}

exports.CFQuery = CFQuery;