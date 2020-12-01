import { setInterval } from 'timers';
import { Utils } from './utils';
import fileutils from './fileutils';
import { CachedProject, ServerConfig } from './model/BotConfig';
import loadCommands from './commandLoader';
import { CacheHandler, GuildHandler } from './data/dataHandler';
import * as config from './data/config.json';
import { CurseHelper } from './curseHelper';
import { buildModEmbed, } from './embedBuilder';
import { Client, Message, Snowflake, TextChannel } from 'discord.js';

const client = new Client();

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

client.on('message', (msg: Message) => {

	// Handle pinging the bot
	if (msg.content === '<@658271214116274196>' && msg.guild.id !== null && msg.guild.available)
		msg.channel.send("Hey, my prefix in this server is: `" + GuildHandler.getServerConfig(msg.guild.id) + '`');

	commands.forEach(command => {
		command.execute(msg);
	});
});


// -------------------------- Scheduled Check --------------------------------------

async function queryServerProjects(guildId: Snowflake, messageTemplate: string, announcementChannel: Snowflake): Promise<void> {

	const channel: TextChannel = await client.channels.fetch(announcementChannel) as TextChannel;
	const projects: CachedProject[] = CacheHandler.getAllCachedProjects();

	projects.forEach(async project => {
		console.log('Checking project: ' + project.id);
		const data = await CurseHelper.queryModById(project.id);
		const newVersion = Utils.getFilenameFromURL(data.latestFile.download_url);
		if (project.version !== newVersion) {
			const embed = buildModEmbed(data);
			CacheHandler.updateCachedProject(project.id, newVersion);

			if (messageTemplate !== '') {
				channel.send(messageTemplate);
			}
			channel.send(embed);
		}
	});
}

setInterval(() => {
	for (const guildId in config.serverConfig) {
		const serverObject: ServerConfig = GuildHandler.getServerConfig(guildId);

		if (serverObject.releasesChannel != '-1') {
			queryServerProjects(guildId, serverObject.messageTemplate, serverObject.releasesChannel)
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