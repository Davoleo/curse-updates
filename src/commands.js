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
		console.log(message);
	}
});

exports.commands = commands;