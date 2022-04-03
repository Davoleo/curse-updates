import { setInterval } from 'timers';
import { Logger, Utils } from './utils';
import { CachedProject } from './model/BotConfig';
import { CacheHandler, GuildHandler, GuildInitializer } from './data/dataHandler';
import * as config from './data/config.json';
import { CurseHelper } from './curseHelper';
import { buildModEmbed } from './embedBuilder';
import { Client, Guild, GuildChannel, Interaction, Message, MessageEmbed, TextChannel } from 'discord.js';
import Command from './model/Command';
import { initCommands, loadCommandFiles } from './commandLoader';

export const botClient = new Client({intents: 'GUILDS'});

export const logger: Logger = new Logger();

const devMode = config.devMode;

const commandsMap: Map<string, Command> = new Map();
//Load Commands from js files
loadCommandFiles().then(commands => {
	//Init Slash Commands
	initCommands(commands);

	//Add loaded commands to a global Map
	for (const command of commands) {
		commandsMap.set(command.name, command);
	}
})

botClient.once('ready', () => {
	logger.info(`Logged in as ${botClient.user.tag}!`);

	Utils.updateBotStatus(botClient, devMode);
});

botClient.on('interactionCreate', async (interaction) => {
	if (interaction.isCommand()) {
		const command = commandsMap.get(interaction.commandName)
		if (Utils.hasPermission(interaction.user.id, interaction.memberPermissions, command.permissionLevel))
			command.execute(interaction);
	}
});

botClient.on('message', (message: Message) => {

	let prefix = '||';

	if (message.guild !== null && message.guild.available) {
		//Initialize the guild if its config is null
		if (GuildHandler.getServerConfig(message.guild.id) == null) {
			GuildInitializer.initServerConfig(message.guild.id, message.guild.name);
			logger.info(`Initializing guild config... :  ${message.guild.name}`)
		}

		prefix = GuildHandler.getServerConfig(message.guild.id).prefix;

		// Handle pinging the bot
		if (message.content === '<@!' + botClient.user.id + '>') {
			GuildInitializer.initServerConfig(message.guild.id, message.guild.name);
			message.channel.send("Hey, my prefix in this server is: `" + prefix + '`\nTry out `' + prefix + 'help` to get a list of commands');
		}

		// logger.info(message)
		if (devMode && message.guild.id !== '500396398324350989' && message.guild.id !== '473145328439132160') {
			return;
		}

		if (message.channel instanceof GuildChannel && !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
			return;
		}
	}

	let cmdString = message.content;
	if (cmdString.startsWith(prefix)) {
		//Trim the prefix
		cmdString = cmdString.replace(prefix, "");
		cmdString = cmdString.trim();

		message.channel.send("HEHE, te NANDAYO!")

		//commands.forEach(command => {
			// const splitCommand = cmdString.split(' ');
			// let sliver = splitCommand.shift();

			// //Check the command category
			// if (command.category === '' || sliver === command.category) {

			// 	if (command.category !== '') {
			// 		sliver = splitCommand.shift();
			// 	}

			// 	//Check the command name
			// 	if (sliver === command.name) {
			// 		//Checks if the message was sent in a server and if the user who sent the message has the required permissions to run the command
			// 		Utils.hasPermission(message, command.permissionLevel).then((pass) => {
			// 			if(pass) {
			// 				//TODO Deduplicate code here and below
			// 				//Handle command execution differently depending if it's a sync or async command
			// 				if (!command.async) {
			// 					const response = command.action(splitCommand, message);
			// 					if (response !== '')
			// 						message.channel.send(response);
			// 				} 
			// 				else {
			// 					command.action(splitCommand, message).then((response: unknown) => {
			// 						message.channel.send(response);
			// 					})
			// 					.catch((error: string) => {
			// 						logger.warn("ERROR: async command execution: ", error)
			// 						message.channel.send('There was an error during the async execution of the command `' + prefix + command.name +  '`, Error: ' + error);
			// 					})
			// 				}
			// 			}
			// 		})
			// 		.catch(error => {
			// 			Utils.sendDMtoBotOwner(botClient, "WARNING: Error during permission evaluation: " + error);
			// 			logger.warn("WARNING: Error during permission evaluation: ", error);
			// 		});
			// 	}
			// }
		//});
	}
});

botClient.on('guildDelete', (guild: Guild) => {
	//Remove data for servers the bot has been kicked/banned from
	GuildInitializer.removeServerConfig(guild.id);
});

botClient.on("error", (err) => {
	logger.error("Error while comunicating with bot client: " + err.message);
});

// -------------------------- Scheduled Check --------------------------------------

async function queryCacheUpdates(): Promise<Map<number, MessageEmbed>> {

	const projects: CachedProject[] = CacheHandler.getAllCachedProjects();

	const updatedProjects: Map<number, MessageEmbed> = new Map();


	for(const project of projects) {		
		//logger.info('Checking project: ' + project.id);
		const data = await CurseHelper.queryModById(project.id);
		const newVersion = Utils.getFilenameFromURL(data.latestFile.downloadUrl);
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
				//logger.info('Will send the message in: ' + channel.name)

				for (const id of guild.projectIds) {
					const embed = updates.get(id);

					if (guild.messageTemplate !== '') {
						await channel.send(guild.messageTemplate);
					}
					if (embed != undefined) {
						await channel.send("NOT IMPLEMENTED YET!!" /*embed*/);
					}
				}
			}
		}
		catch(error) {
			if (error == "DiscordAPIError: Missing Access" || error == "DiscordAPIError: Unknown Channel") {
				const discordGuild = await botClient.guilds.fetch(guild.serverId);
				
				botClient.users.fetch(discordGuild.ownerId)
				.then(owner => {
					owner.send("CHANNEL ACCESS ERROR - Resetting the annoucement channel for your server: " + discordGuild.name + "\nPlease Give the bot enough permission levels to write in the annoucements channel.")
				})
				Utils.sendDMtoBotOwner(botClient, "CHANNEL ACCESS ERROR - Resetting the annoucement channel for server: " + discordGuild.name + ` (${discordGuild.id})`);
				
				GuildHandler.resetReleaseChannel(discordGuild.id);
			}
			else {
				Utils.sendDMtoBotOwner(botClient, 'Error sending mod update information in one of the guilds: ' + error);
				logger.warn('WARNING: A promise was rejected!', error);
			}
		}
	}
}

/*
setInterval(() => {
	queryCacheUpdates()
	.then(updates => {
		if (updates.size > 0) {
			sendUpdateAnnouncements(updates);
		}
	})
	.catch(error => logger.error("There was an error when querying cached projects: ", error));

}, 1000 * 60 * 15);
// 15 Minutes
*/

setInterval(() => {
	Utils.updateBotStatus(botClient, devMode);
}, 1000 * 60 * 60)
// 1 Hour

//process.on('unhandledRejection', (reason, promise) => {
//	promise.catch(() => logger.error("Damn boi, how did this happen " + reason));
	//throw reason;
//})

botClient.login(config.token);