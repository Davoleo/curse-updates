import {Utils} from './util/discord.js';
import {CurseHelper} from './curseHelper.js';
import {Client, Events, Guild} from 'discord.js';
import Command from './model/Command.js';
import Environment from './util/Environment.js';
import {initScheduler} from './scheduler.js';
import {Logger} from './util/log.js';
import {DBHelper} from './data/dataHandler.js';
import GuildService from "./services/GuildService.js";
import {initCommands, loadCommandFiles} from './commandLoader.js'
import {strict as assert} from 'assert';

export const botClient = new Client({intents: 'Guilds'});

export const logger: Logger = new Logger();

DBHelper.init();

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

CurseHelper.init().catch(err => {
	console.warn("Error while initializing CurseForge Games");
	console.error(err);
});

botClient.once(Events.ClientReady, () => {
	assert(botClient.user)
	logger.info(`Logged in as ${botClient.user.tag}!`);

	Utils.updateBotStatus(botClient.user, Environment.get().DevMode);
});

botClient.on(Events.InteractionCreate, (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = commandsMap.get(interaction.commandName);

		const subcommand = interaction.options.getSubcommand(false) ?? "";
		command!.execute(interaction, subcommand);
	}

	if (interaction.isAutocomplete()) {
		console.log("Autocomplete Event");
		const command = commandsMap.get(interaction.commandName);
		command!.handleAutocomplete(interaction);
	}
});

botClient.on(Events.GuildCreate, (guild: Guild) => {
	void GuildService.initServer({
		id: guild.id,
		name: guild.name
	});
});

botClient.on(Events.GuildDelete, (guild: Guild) => {
	//Remove data for servers the bot has been kicked/banned from
	try {
		GuildService.removeServer(guild.id);
	}
	catch (e) {
		logger.warn("guildDelete(" + guild.name + "): " + e.message)
	}
});

botClient.on(Events.Error, (err) => {
	logger.error("ERROR: " + err.name);
	logger.error("message: " + err.message);
	logger.error(err.stack ?? 'NO STACK')
});

botClient.on(Events.ShardError, err => {
	logger.error("SHARD ERROR: " + err.name);
	logger.error("message: " + err.message);
	logger.error(err.stack ?? 'NO STACK')
});

/*- Node.js events -*/
process.on('unhandledRejection', (reason, promise) => {
	promise.catch(() => logger.error("Damn boi, how did this happen " + reason));
	throw reason;
});

process.on('uncaughtException', (error, origin) => {
	logger.error("GENERIC ERROR - " + error.name + ": " + error.message);
	if (error.stack) {
		logger.error(error.stack);
	}

	throw origin;
});

process.on('warning', logger.warn);
/*-------------------*/

initScheduler();

void botClient.login(Environment.get().DiscordToken);