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
import UpdatesService from "./services/UpdatesService.js";
import BotConfig from "./util/BotConfig.js";

export const botClient = new Client({intents: 'Guilds'});

export const logger: Logger = new Logger(Environment.get().LogLevel);

BotConfig.preLoad();
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
	Logger.I.info(`Logged in as ${botClient.user.tag}!`);

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

botClient.on(Events.GuildDelete, async (guild: Guild) => {
	try {
		//Remove all update configs
		await UpdatesService.clearReportTemplates(guild.id);

		//Clear projects from the server config [+ clean-up cache]
		await GuildService.clearProjects(guild.id, true)

		//Remove server from DB
		await GuildService.removeServer(guild.id);
		Logger.I.info(`guildDelete(${guild.name}) successful!`)
	}
	catch (err) {
		Logger.I.error(`guildDelete(${guild.name}) error: ${err}`);
		Utils.sendDMtoBotOwner(botClient, `guildDelete(${guild.name}) error: ${err}`)
	}
});

botClient.on(Events.Error, (err) => {
	Logger.I.error("ERROR: " + err.name);
	Logger.I.error("message: " + err.message);
	Logger.I.error(err.stack ?? 'NO STACK')
});

botClient.on(Events.ShardError, err => {
	Logger.I.error("SHARD ERROR: " + err.name);
	Logger.I.error("message: " + err.message);
	Logger.I.error(err.stack ?? 'NO STACK')
});

/*- Node.js events -*/
process.on('unhandledRejection', (reason, promise) => {
	promise.catch(() => Logger.I.error("Damn boi, how did this happen " + reason));
	throw reason;
});

process.on('uncaughtException', (error, origin) => {
	Utils.sendDMtoBotOwner(botClient, "GENERIC ERROR - " + error.name + ": " + error.message)
	Logger.I.error("GENERIC ERROR - " + error.name + ": " + error.message);
	if (error.stack) {
		Logger.I.error(error.stack);
	}

	Logger.I.error(origin);
});

process.on('warning', Logger.I.warn);
/*-------------------*/

initScheduler();

void botClient.login(Environment.get().DiscordToken);