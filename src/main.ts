import * as discord from 'discord.js';
import { setInterval } from 'timers';
import { Utils } from './utils';
import fileutils from './fileutils';
import { CachedProject, ServerConfig } from './model/BotConfig';
import loadCommands from './commandLoader';
import { GuildHandler } from './data/dataHandler';

const client = new discord.Client();

const devMode = true;

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

	// Set the bot status
	if(devMode) {
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

export const commands = loadCommands();

client.on('message', msg => {

	// Handle pinging the bot
	if (msg.content === '<@658271214116274196>' && msg.guild.id !== null && msg.guild.available)
		msg.channel.send("Hey, my prefix in this server is: `" + GuildHandler.getServerConfig(msg.guild.id) + '`');

	commands.forEach(command => {
		command.execute(msg);
	});
});

async function queryServerProjects(guildId: discord.Snowflake, projectIds: Array<CachedProject>, announcementChannel: discord.Snowflake): Promise<Array<discord.MessageEmbed>> {
	const embeds: Array<discord.MessageEmbed> = [];

	const channel: discord.TextChannel = await client.channels.fetch(announcementChannel) as discord.TextChannel;

	await projectIds.forEach(async project => {
		console.log('Checking project: ' + project.id);
		const latestEmbed = await Utils.queryLatest(project.id);
		if (latestEmbed != null) {
			const newVersion = latestEmbed.fields[2].value;
			if (project.version !== newVersion) {
				embeds.push(latestEmbed);
				fileutils.updateCachedProject(guildId, project.id, newVersion);
				const messageTemplate = GuildHandler.getTemplateMessage(guildId);
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
		const serverObject: ServerConfig = config.serverConfig[guildId];

		if (serverObject.releasesChannel != '-1') {
			queryServerProjects(guildId, GuildHandler, serverObject.releasesChannel)
				.catch((error) => {
					if (error == "DiscordAPIError: Missing Access") {
						// TODO Temporary Solution to fix error spam when the bot is kicked from a server
						fileutils.resetReleasesChannel(guildId);
						Utils.sendDMtoDavoleo(client, "CHANNEL ACCESS ERROR - Resetting the annoucement channel for server https://discordapp.com/api/guilds/" + guildId + "/widget.json");
					}
					Utils.sendDMtoDavoleo(client, 'Error while quering scheduled projects: ' + error);
					console.warn('There was a problem while doing the usual scheduled task!', error);
				});
		}
	}
}, 1000 * 60 * 15);
// 15 Minutes

client.login(config.token);