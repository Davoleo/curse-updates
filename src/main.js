const config = require('./cfg.json');
const discord = require('discord.js');
const client = new discord.Client();
const { commands } = require('./commands');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if(msg.content.startsWith(config.prefix)) {
		// The Command message trimmed of the prefix
		const trimmedCommand = msg.content.replace(config.prefix, '');
		// If the command message is equals to one of the commands in the Map
		for (const command of commands.keys()) {
			if(trimmedCommand.indexOf(command) !== -1) {
				// Invoke the Command Function
				// console.log('"' + trimmedCommand + '"');
				commands.get(command)(msg);
			}
		}
	}
});

client.login(config.token);