const config = require('../cfg.json');
const discord = require('discord.js');
const client = new discord.Client();
const { commands } = require('./commands');
const { setInterval } = require('timers');
const { Utils } = require('./utils');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if(msg.content.startsWith(config.prefix)) {
		// The Command message trimmed of the prefix
		const trimmedCommand = msg.content.replace(config.prefix, '');
		// If the command message is equals to one of the commands in the Map
		for (const command of commands.keys()) {
			if(trimmedCommand.indexOf(command) !== -1) {
				// Invoke the Command Function
				// console.log('"' + trimmedCommand + '"');
				commands.get(command)(msg);
			}
		}
	}
});

async function queryServerProjects(guildId, projectIds, announcementChannel) {
	const embeds = [];

	const channel = await client.channels.fetch(announcementChannel);

	await projectIds.forEach(async project => {
		console.log('Checking project: ' + project.id);
		const latestEmbed = await Utils.queryLatest(project.id);
		const newVersion = latestEmbed.fields[2].value;
		console.log('Chiamato');
		if (project.version !== newVersion) {
			embeds.push(latestEmbed);
			Utils.updateCachedProject(guildId, project.id, newVersion);
			channel.send(latestEmbed);
		}
	});

	return embeds;
}

setInterval(() => {
	for (const guildId in config.serverConfig) {
		const serverObject = config.serverConfig[guildId];

		if (serverObject.releasesChannel !== -1) {
			queryServerProjects(guildId, serverObject.projects, serverObject.releasesChannel).catch(error => {
				console.warn('There was a problem while doing the usual scheduled task!', error);
			});
		}
	}
}, 900000);
// 15 Minutes

client.login(config.token);