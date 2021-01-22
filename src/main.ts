import { setInterval } from 'timers';
import { Utils } from './utils';
import { CachedProject } from './model/BotConfig';
import { CacheHandler, GuildHandler, GuildInitializer } from './data/dataHandler';
import * as config from './data/config.json';
import { CurseHelper } from './curseHelper';
import { buildModEmbed, } from './embedBuilder';
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js';
import Command from './model/Command';
import { loadCommands } from './commandLoader';

export const botClient = new Client();

const devMode = config.devMode;
let ready = false;

botClient.on('ready', () => {
	console.log(`Logged in as ${botClient.user.tag}!`);

	// Set the bot status
	if(devMode) {
		botClient.user.setPresence({
			status: 'dnd',
			afk: false,
			activity: {
				name: ' with Davoleo in VSCode',
				type: 'PLAYING',
			},
		});
	}
	else {
		botClient.user.setPresence({
			status: 'online',
			afk: false,
			activity: {
				name: ' for new updates',
				type: 'WATCHING',
			},
		});
	}
});

export let commands: Command[] = null;
loadCommands().then(comms => { 
	commands = comms;
	ready = true;
});


botClient.on('message', (message: Message) => {

	if (message.guild !== null && message.guild.available) {
		if (GuildHandler.getServerConfig(message.guild.id) == null) {
			GuildInitializer.initServerConfig(message.guild.id, message.guild.name);
			console.log("Init......")
		}
	}
	const prefix = message.guild !== null ? GuildHandler.getServerConfig(message.guild.id).prefix : '||';

	// Handle pinging the bot
	if (message.content === '<@!' + botClient.user.id + '>') {
		GuildInitializer.initServerConfig(message.guild.id, message.guild.name);
		message.channel.send("Hey, my prefix in this server is: `" + prefix + '`\nTry out `' + prefix + 'help` to get a list of commands');
	}

	// console.log(message)
	if (devMode && message.guild.id !== '500396398324350989' && message.guild.id !== '473145328439132160') {
		return;
	}
	if (!ready) {
		return;
	}

	let cmdString = message.content;
	if (cmdString.startsWith(prefix)) {
		//Trim the prefix
		cmdString = cmdString.replace(prefix, "");
		cmdString = cmdString.trim();

		commands.forEach(command => {
			
			const splitCommand = cmdString.split(' ');
			let sliver = splitCommand.shift();

			//Check the command category
			if (command.category === '' || sliver === command.category) {

				if (command.category !== '') {
					sliver = splitCommand.shift();
				}

				//Check the command name
				if (sliver === command.name) {
					// if it's a guild command check for guild permissions
					if (command.isGuildCommand) {
						//Checks if the message was sent in a server and if the user who sent the message has the required permissions to run the command
						Utils.hasPermission(message, command.permissionLevel).then((pass) => {
							if(pass) {
								//Handle command execution differently depending if it's a sync or async command
								if (!command.async) {
									const response = command.action(splitCommand, message);
									if (response !== '')
										message.channel.send(response);
								} 
								else {
									command.action(splitCommand, message).then((response: unknown) => {
										message.channel.send(response);
									})
									.catch((error: string) => {
										console.warn("Error: ", error)
										message.channel.send('There was an error during the async execution of the command `' + prefix + command.name +  '`, Error: ' + error);
									})
								}
							}
						});
					} else {
						//Handle command execution differently depending if it's a sync or async command
						if (!command.async) {
							const response = command.action(splitCommand, message);
							if (response !== '')
								message.channel.send(response);
						} else {
							command.action(splitCommand, message).then((response: unknown) => {
								message.channel.send(response);
							})
							.catch((error: string) => {
								console.warn("Error: ", error)
								message.channel.send('There was an error during the async execution of the command `' + prefix + command.name +  '`, Error: ' + error);
							})
						}
					}
				}
			}
		});
	}
});


// -------------------------- Scheduled Check --------------------------------------

async function queryCacheUpdates(): Promise<Map<number, MessageEmbed>> {

	const projects: CachedProject[] = CacheHandler.getAllCachedProjects();

	const updatedProjects: Map<number, MessageEmbed> = new Map();


	for(const project of projects) {		
		//console.log('Checking project: ' + project.id);
		const data = await CurseHelper.queryModById(project.id);
		const newVersion = Utils.getFilenameFromURL(data.latestFile.download_url);
		if (project.version !== newVersion) {
			const embed = buildModEmbed(data);
			CacheHandler.updateCachedProject(project.id, newVersion);
			updatedProjects.set(project.id, embed);
		}
	}

	return updatedProjects;
}

async function sendUpdateAnnouncements(updates: Map<number, MessageEmbed>) {
	
	const guilds = GuildHandler.getAllServerConfigs();

	for (const guild of guilds) {
		try {
			if (guild.releasesChannel !== '-1') {
				const channel: TextChannel = await botClient.channels.fetch(guild.releasesChannel) as TextChannel;
				//console.log('Will send the message in: ' + channel.name)

				for (const id of guild.projectIds) {
					const embed = updates.get(id);

					if (guild.messageTemplate !== '') {
						await channel.send(guild.messageTemplate);
					}
					await channel.send(embed);
				}
			}
		}
		catch(error) {
			if (error == "DiscordAPIError: Missing Access") {
				GuildHandler.resetReleaseChannel(guild.serverId);
				Utils.sendDMtoDavoleo(botClient, "CHANNEL ACCESS ERROR - Resetting the annoucement channel for server https://discordapp.com/api/guilds/" + guild.serverId + "/widget.json");
			}
			Utils.sendDMtoDavoleo(botClient, 'Error while quering scheduled projects: ' + error);
			console.warn('There was a problem while doing the usual scheduled task!', error);
		}
	}
}

setInterval(() => {
	queryCacheUpdates()
	.then(updates => {
		sendUpdateAnnouncements(updates);
	});

}, 1000 * 60);
// 15 Minutes

botClient.login(config.token);