const { Utils } = require('./utils');

const cf = require('mc-curseforge-api');

exports.cfquery = {

	queryLatest(id) {
		cf.getMod(id).then((mod) => {
			const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
			const embed = Utils.buildModEmbed(mod, latestFile);
			return embed;
		},
		(error) => {
			return 'Error: ' + error + '!';
		});
	},

	getModById(id) {
		cf.getMod(id).then((mod) => {
			return mod;
		},
		() => {
			return null;
		},
		);
	},
};