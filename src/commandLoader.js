import {Routes} from 'discord-api-types/v9'
import {REST} from '@discordjs/rest';
import Environment from './util/Environment.js';
import {Logger} from "./util/log.js";
import {readdirSync} from "fs";

export async function loadCommandFiles() {

	let commands = [];
	
	let files = readdirSync('./build/commands');
	files = files.filter(file => file.endsWith('.js'));
	Logger.I.info("Loading " + files.length + " commands");
	for (const file of files) {
		Logger.I.debug(file);
		const script = await import('./commands/' + file);
		commands.push(script.command);
	}

	return commands;
}

export function initCommands(commands) {
	
	const env = Environment.get()

	const rest = new REST({version: '9'}).setToken(env.DiscordToken);

	const jsonCommands =  commands.map((command) => command.toJSON());

	if (env.DevMode) {
		for (let i = 0; i<env.TestingServers.length; i++) {
			rest.put(Routes.applicationGuildCommands(env.BotId, env.TestingServers[i]), {body: jsonCommands})
				.then(() => Logger.I.info("Succesfully registered Slash Commands to Testing Server " + i))
				.catch(console.warn)
		}
	}
	else {

		rest.put(Routes.applicationCommands(env.BotId), {body: jsonCommands})
			.then(() => {
				Logger.I.info("Succesfully registered GLOBAL Slash Commands");
				//Cleanup guild commands
				return Promise.all(env.TestingServers.map(server => {
					return rest.put(Routes.applicationGuildCommands(env.BotId, server))
				}));
			})
			.then(() => Logger.I.info("Successfully cleaned up Guild Commands"))
			.catch(console.warn)
	}
}