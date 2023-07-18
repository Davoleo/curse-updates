import {Utils} from './util/discord';
import {CurseHelper} from './curseHelper';
import {Client, Guild, Snowflake} from 'discord.js';
import Command from './model/Command';
import {initCommands, loadCommandFiles} from './commandLoader';
import Environment from './util/Environment';
import {initScheduler} from './scheduler';
import {Logger} from './util/log';
import {DBHelper} from './data/dataHandler';
import assert from 'assert';
import GuildService from "./services/GuildService";
import {Modal} from "./discord/modals";

export const botClient = new Client({intents: 'Guilds'});

export const logger: Logger = new Logger();

export const activeModals = new Map<Snowflake, Modal>();

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

botClient.once('ready', () => {
	assert(botClient.user !== null);
	logger.info(`Logged in as ${botClient.user.tag}!`);
	Utils.updateBotStatus(botClient.user, Environment.get().DevMode);
});

botClient.on('interactionCreate', (interaction) => {
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

botClient.on('guildCreate', (guild: Guild) => {
	void GuildService.initServer({
		id: guild.id,
		name: guild.name
	});
});

botClient.on('guildDelete', (guild: Guild) => {
	//Remove data for servers the bot has been kicked/banned from
	GuildService.removeServer(guild.id);
});

botClient.on("error", (err) => {
	logger.error("Error while comunicating with bot client: " + err.message);
});

//process.on('unhandledRejection', (reason, promise) => {
//	promise.catch(() => logger.error("Damn boi, how did this happen " + reason));
	//throw reason;
//})

initScheduler();

botClient.login(Environment.get().DiscordToken);