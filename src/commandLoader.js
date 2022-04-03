import * as fs from 'fs';
import { logger } from './main';
import * as config from './data/config.json';
import { Routes } from 'discord-api-types/v9'
import { REST } from '@discordjs/rest';

async function loadCommandFiles() {

	let commands = [];
	
	let files = fs.readdirSync('./build/commands');
	files = files.filter(file => file.endsWith('.js'));
	logger.info("Loading " + files.length + " commands");
	for (const file of files) {
		const script = await import('./commands/' + file);
		//logger.info(script);
		commands.push(script.command);
	}

	return commands;
}

function initCommands(commands) {
	
	const rest = new REST({version: '9'}).setToken(config.token);

	const jsonCommands =  commands.map((command) => command.toJSON());

	if (config.devMode) {
		rest.put(Routes.applicationGuildCommands(config.botId, config.testingServer), {body: jsonCommands})
		.then(() => logger.info("Succesfully registered Slash Commands"))
		.catch(console.warn)
	}
}

exports.loadCommandFiles = loadCommandFiles;
exports.initCommands = initCommands;