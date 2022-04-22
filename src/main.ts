import { Logger, Utils } from './utils';
import { CurseHelper } from './curseHelper';
import { Client, Guild } from 'discord.js';
import Command from './model/Command';
import { initCommands, loadCommandFiles } from './commandLoader';
import Environment from './model/Environment';
import * as assert from 'assert';
import ServerManager from './data/ServerManager';

export const botClient = new Client({intents: 'GUILDS'});

export const logger: Logger = new Logger();

export const commandsMap: Map<string, Command> = new Map();
//Load Commands from js files
loadCommandFiles().then(commands => {
	//Init Slash Commands
	initCommands(commands);

	//Add loaded commands to a global Map
	for (const command of commands) {
		commandsMap.set(command.name, command);
	}
});

CurseHelper.init();

botClient.once('ready', () => {
	assert(botClient.user);
	logger.info(`Logged in as ${botClient.user.tag}!`);
	Utils.updateBotStatus(botClient.user, Environment.get().DevMode);
});

botClient.on('interactionCreate', async (interaction) => {
	if (interaction.isCommand()) {
		const command = commandsMap.get(interaction.commandName)
			command!.execute(interaction);
	}
});

botClient.on('guildDelete', (guild: Guild) => {
	//Remove data for servers the bot has been kicked/banned from
	ServerManager.ofServer(guild.id).then(manager => manager?.removeSelf());
});

botClient.on("error", (err) => {
	logger.error("Error while comunicating with bot client: " + err.message);
});

//process.on('unhandledRejection', (reason, promise) => {
//	promise.catch(() => logger.error("Damn boi, how did this happen " + reason));
	//throw reason;
//})

botClient.login(Environment.get().DiscordToken);