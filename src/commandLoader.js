import * as fs from 'fs';
import { logger } from './main';
import * as config from './data/config.json';
import { Routes } from 'discord-api-types/v9'
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';

async function loadCommands() {

	let testCommandsArray = [
		new SlashCommandBuilder().setName('ping').setDescription('QUANTUM PING PONG GAME!')
	];

	testCommandsArray.map((command) => command.toJSON());

	const rest = new REST({version: '9'}).setToken(config.token);
	rest.put(Routes.applicationGuildCommands('658271214116274196', '500396398324350989'), {body: testCommandsArray})
	.then(() => console.log("Succesfully registered example slash command."))
	.catch(console.warn);

	// const commands = [];

	// fs.readdir('./build/commands/util', (error, files) => {
	// 	if (error)
	// 		logger.error("commandLoaderError: " + error);
	// 	files = files.filter(file => !file.endsWith('map'));
	// 	logger.info("Loading " + files.length + " util commands");
	// 	files.forEach(async file => {
	// 		const command = await import("./commands/util/" + file);
	// 		// logger.info(command.comm);
	// 		commands.push(command.comm);
	// 	});
	// });
	
	// fs.readdir('./build/commands/schedule', (error, files) => {
	// 	if (error)
	// 		logger.error("commandLoaderError: " + error);
	// 	files = files.filter(file => !file.endsWith('map'));
	// 	logger.info("Loading " + files.length + " scheduling commands");
	// 	files.forEach(async file => {
	// 		const command = await import('./commands/schedule/' + file);
	// 		// logger.info(command.comm);
	// 		commands.push(command.comm);
	// 	});
	// });

	// return commands;
}

exports.loadCommands = loadCommands;