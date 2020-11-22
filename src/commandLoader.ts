import Command from './model/Command';
import * as fs from 'fs';

// const config: BotConfig = Object.assign(configJson);

export default function loadCommands(): Array<Command> {
	const commands = new Array<Command>();

	fs.readdir('./build/commands/util', (error, files) => {
		if (error)
			console.error(error);
		console.log("Loading " + files.length + " util commands");
		files.forEach(file => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const command = require('./commands/util/' + file);
			commands.push(command);
			delete require.cache[require.resolve("./commands/util/" + file)];
		});
	});
	
	fs.readdir('./build/commands/schedule', (error, files) => {
		if (error)
			console.error(error);
		console.log("Loading " + files.length + " scheduling commands");
		files.forEach(file => {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const command = require('./commands/schedule/' + file);
			commands.push(command);
			delete require.cache[require.resolve("./commands/schedule/" + file)];
		});
	});

	return commands;
}