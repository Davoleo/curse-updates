const config = require('./cfg.json');
const { Utils } = require('./utils');

const commands = new Map();

commands.set('ping', (message) => {
	message.channel.send('PONG! - Response Time: ' + message.client.ws.ping + 'ms');
});

commands.set('changeprefix', (msg) => {
	let message = msg.content;
	if (message !== '') {
		// Trim out everything that is not the new prefix
		message = message.replace(config.prefix + 'changeprefix ', '');
		if (message.length > 1) {
			msg.channel.send('You can only assign a string of one character as prefix!');
		}
		else {
			Utils.savePrefix(message);
			msg.channel.send('`' + message + '` is now the current prefix for commands');
		}
	}
});

// commands.set('cflatest')

commands.set('help', (message) => {
	const embed = Utils.createEmbed();

	embed.addFields([
		{
			name: config.prefix + 'ping',
			value: 'Sends a message with information about the latency of the bot response',
		},
		{
			name: config.prefix + 'changeprefix `<prefix>`',
			value: 'Changes the command prefix of the bot to the char passed as argument - the prefix is reset to `|` after a bot restart',
		},
		{
			name: config.prefix + 'help',
			value: 'Shows this embed with a list of all the available commands and their usage and descriptions',
		},
	]);

	message.channel.send(embed);
});

exports.commands = commands;