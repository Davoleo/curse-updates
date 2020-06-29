const { Utils } = require('./utils');
const cf = require('mc-curseforge-api');

function queryLatest(id) {
	cf.getMod(id).then((mod) => {
		const latestFile = mod.latestFiles[mod.latestFiles.length - 1];
		const embed = Utils.buildModEmbed(mod, latestFile);
		return embed;
	}, (error) => {
		return 'Error: ' + error + '!';
	});
}

function getModById(id) {

	let modInstance = null;

	cf.getMod(id).then((mod) => {
		modInstance = mod;
	});

	return modInstance;
}

exports.cfquery = {
	queryLatest,
	getModById,
};