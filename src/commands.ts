import * as configJson from './cfg.json';
import { Utils } from './utils';
import fileUtils from './fileutils';
import { Message } from 'discord.js';
import { BotConfig } from './model/BotConfig';
import Command from './model/Command';
import * as fs from 'fs';

const config: BotConfig = Object.assign(configJson);

export const commands = new Array<Command>();

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

commands.set('latest', (message: Message) => {
	const id = message.content.replace(config.prefix + 'latest ', '');

	if (id !== '') {
		Utils.queryLatest(id as unknown as number)
			.then((response) => {
				if (response !== undefined && response !== null) {
					message.channel.send(response);
				}
				else {
					message.channel.send('Response is invalid :(');
				}
			}).catch(error => {
				console.warn("Error: ", error)
				message.channel.send('A promise has been rejected, Error: ' + error);
			});
	}
});

commands.set('schedule add', (message: Message) => {
	Utils.hasPermission(message).then((hasPermission) => {
		if (hasPermission) {
			fileUtils.initSaveGuild(message.guild.id);
			const projectID = message.content.replace(config.prefix + 'schedule add ', '');
			if (projectID.match(/\d+/)[0] !== '') {
				fileUtils.addProjectToConfig(message.guild.id, projectID as unknown as number)
					.then((resMessage) => message.channel.send(resMessage))
					.catch((error) => {
						console.log(error);
						message.channel.send('There was an issue adding this project to the schedule');
					});
			}
			else {
				message.channel.send('Project ID is invalid!');
			}
		}
	})
});

commands.set('schedule remove', (message: Message) => {
	Utils.hasPermission(message).then((hasPermission) => {
		if (hasPermission) {
			fileUtils.initSaveGuild(message.guild.id);
			const projectID = message.content.replace(config.prefix + 'schedule remove ', '');
			if (projectID.match(/\d+/)[0] !== '') {
				const stringResult = fileUtils.removeProjectFromConfig(message.guild.id, projectID as unknown as number);
				message.channel.send(stringResult);
			}
			else {
				message.channel.send('Project ID is invalid!');
			}
		}
	});
});

commands.set('schedule clear', (message: Message) => {
	Utils.hasPermission(message).then((hasPermission) => {
		if (hasPermission) {
			fileUtils.initSaveGuild(message.guild.id);
			fileUtils.clearSchedule(message.guild.id);
			message.channel.send(':warning: Scheduled was cleared successfully! :warning:');
		}
	});
});

commands.set('schedule setchannel', (message: Message) => {
	Utils.hasPermission(message).then((hasPermission) => {
		if (hasPermission) {
			fileUtils.initSaveGuild(message.guild.id);

			let channelId = message.content.replace(config.prefix + 'schedule setchannel <#', '');
			channelId = channelId.replace('>', '');
	
			if (!channelId.startsWith(config.prefix) && channelId.length > 0) {
				fileUtils.saveReleasesChannel(message.guild.id, channelId);
				message.channel.send('Scheduled projects announcements will start to appear in <#' + channelId + '> once a new project update is published!');
			}
			else {
				message.channel.send('The provided channel reference is invalid!');
			}
		}
	});
});

commands.set('schedule clearchannel', (message: Message) => {
	Utils.hasPermission(message).then((hasPermission) => {
		if (hasPermission) {
			fileUtils.initSaveGuild(message.guild.id);
			fileUtils.resetReleasesChannel(message.guild.id);
			message.channel.send('Scheduled update channel has been set to "None", Updates annoucements have been disabled on this server');
		}
	});
});

commands.set('schedule template', (message: Message) => {
	Utils.hasPermission(message).then((hasPermission) => {
		if (hasPermission) {
			fileUtils.initSaveGuild(message.guild.id);
			const template = message.content.replace(config.prefix + 'schedule template', '').trimLeft();
			fileUtils.setTemplateMessage(message.guild.id, template);
			if (template !== '') {
				message.channel.send('The template message has been set to: ```' + template + '```');
			}
			else {
				message.channel.send('The template message has been reset to: ""');
			}
		}
	});
});

commands.set('schedule show', (message: Message) => {
	Utils.hasPermission(message).then((hasPermission) => {
		if(hasPermission) {
			fileUtils.initSaveGuild(message.guild.id);
			Utils.buildScheduleEmbed(message.guild.id, message.client).then(embed => {
				message.channel.send(embed);
			});
		}
	})
});

commands.set('test', (message: Message) => {
	if(message.author.id == '143127230866915328') {
		fileUtils.initSaveGuild(message.guild.id);
	}
});

commands.set('updatestuff', (message: Message) => {
	if (message.author.id == '143127230866915328') {
		for (const serverId in config.serverConfig) {
			config.serverConfig[serverId].messageTemplate = '';
			fileUtils.updateJSONConfig(config);
		}
	}
	message.channel.send('OwO update complete!');
});

commands.set('help', (message: Message) => {
	const embed = Utils.createEmbed('Commands: ');

	embed.addFields([
		{
			name: config.prefix + 'ping',
			value: 'Sends a message with information about the latency of the bot response',
		},
		{
			name: config.prefix + 'changeprefix `<prefix>`',
			value: 'Changes the command prefix of the bot to the char passed as argument',
		},
		{
			name: config.prefix + 'latest `<projectID>`',
			value: 'Queries Curseforge to get the latest version of a mod or modpack',
		},
		{
			name: config.prefix + 'schedule show',
			value: 'Shows the scheduled project updates announcements of the current server and the announcements channel',
		},
		{
			name: config.prefix + 'schedule setchannel `<channel>`',
			value: 'Sets the channel this command is sent to as the projects update annoucements channel of the current server',
		},
		{
			name: config.prefix + 'schedule clearchannel',
			value: 'Resets the projects update annoucements channel of the current server to "None" (no further updates will be posted) [can be used anywhere in the server]',
		},
		{
			name: config.prefix + 'schedule add `<projectID>`',
			value: 'Adds a Curseforge project to the scheduled check that runs once every 15 minutes',
		},
		{
			name: config.prefix + 'schedule remove `<projectID>`',
			value: 'Removes a Curseforge project from the scheduled check that runs once every 15 minutes',
		},
		{
			name: config.prefix + 'schedule clear',
			value: 'Removes all Curseforge projects from the scheduled check that runs once every 15 minutes',
		},
		{
			name: config.prefix + 'schedule template `<announcementMessage>`',
			value: 'Sets a template message that is sent together with the update embed once a project update is released (empty template will reset this setting)',
		},
		{
			name: config.prefix + 'help',
			value: 'Shows this embed with a list of all the available commands and their usage and descriptions',
		},
	]);

	message.channel.send(embed);
});

exports.commands = commands;