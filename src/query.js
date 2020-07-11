const { Utils } = require('./utils');

const cf = require('mc-curseforge-api');

class CFQuery {
	static async queryLatest(id) {
		const mod = await cf.getMod(id);
		const latestFile = mod.latestFiles[0];
		console.log(mod);
		const embed = Utils.buildModEmbed(mod, latestFile);
		return embed;
	}

	// cf getMod Wrapper function
	static async getModById(id) {
		return cf.getMod(id);
	}
}

exports.CFQuery = CFQuery;