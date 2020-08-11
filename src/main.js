const config = require('../cfg.json');
const discord = require('discord.js');
const client = new discord.Client();
const { commands } = require('./commands');
const { setInterval } = require('timers');
const { Utils } = require('./utils');
const fileutils = require('./fileutils');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

	// Set the bot status
	if(config.prefix === ':||') {
		client.user.setPresence({
			status: 'dnd',
			afk: false,
			activity: {
				name: ' with Davoleo in VSCode',
				type: 'PLAYING',
			},
		});
	}
	else {
		client.user.setPresence({
			status: 'online',
			afk: false,
			activity: {
				name: ' for new updates',
				type: 'WATCHING',
			},
		});
	}
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
		if (latestEmbed != null) {
			const newVersion = latestEmbed.fields[2].value;
			if (project.version !== newVersion) {
				embeds.push(latestEmbed);
				fileutils.updateCachedProject(guildId, project.id, newVersion);
				const messageTemplate = config.serverConfig[guildId].messageTemplate;
				if (messageTemplate !== '') {
					channel.send(messageTemplate);
				}
				channel.send(latestEmbed);
			}
		}
	});

	return embeds;
}

setInterval(() => {
	for (const guildId in config.serverConfig) {
		const serverObject = config.serverConfig[guildId];

		if (serverObject.releasesChannel !== -1) {
			queryServerProjects(guildId, serverObject.projects, serverObject.releasesChannel)
				.catch((error) => {
					Utils.sendDMtoDavoleo(client, 'Error while quering scheduled projects: ' + error);
					console.warn('There was a problem while doing the usual scheduled task!', error);
				});
		}
	}
}, 1000 * 60 * 15);
// 15 Minutes

client.login(config.token);