import * as fs from 'fs';
import {logger} from './main.js';
import {Routes} from 'discord-api-types/v9'
import {REST} from '@discordjs/rest';
import Environment from './util/Environment.js';

export async function loadCommandFiles() {

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

export function initCommands(commands) {
	
	const env = Environment.get()

	const rest = new REST({version: '9'}).setToken(env.DiscordToken);

	const jsonCommands =  commands.map((command) => command.toJSON());

	if (env.DevMode) {
		rest.put(Routes.applicationGuildCommands(env.BotId, env.TestingServers[0]), {body: jsonCommands})
		.then(() => logger.info("Succesfully registered Slash Commands to Testing Server 1"))
		.catch(console.warn)

		rest.put(Routes.applicationGuildCommands(env.BotId, env.TestingServers[1]), {body: jsonCommands})
		.then(() => logger.info("Succesfully registered Slash Commands to Testing Server 2"))
		.catch(console.warn)
	}
}