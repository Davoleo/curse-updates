import { Client, Message, StringResolvable } from 'discord.js';
import { createWriteStream, WriteStream } from 'fs';
import * as config from './data/config.json';

///The different levels of permission that may be needed to execute a certain command
export enum Permission {
    USER,
    MODERATOR,
    ADMINISTRATOR,
    OWNER
}

export class Logger {

	private filename: string;
	private logStream: WriteStream;

	constructor(filename: string) {
		this.filename = filename;
		this.logStream = createWriteStream(filename, {});
	}

	private appendLogLine(line: string, ...extras: unknown[]): void {
		this.logStream.write(line + '\n', (error) => {
			if (error)
				console.error("Error while writing to " + this.filename +  ": ", error);
		});
		if (extras.length > 0)
			this.logStream.write(JSON.stringify(extras) + '\n');
	}

	public info(message: string, ...params: StringResolvable[]): void {
		const prefixedMessage = "[INFO] curse_updates: " + message;
		console.log(prefixedMessage, ...params);

		this.appendLogLine(prefixedMessage, ...params);
	}

	public warn(message: string, ...params: StringResolvable[]): void {
		const prefixedMessage = "[WARN] curse_updates: " + message;
		console.warn(prefixedMessage, ...params);

		this.appendLogLine(prefixedMessage, ...params);
	}

	public error(message: string, ...params: StringResolvable[]): void {
		const prefixedMessage = "[ERROR] curse_updates: " + message;
		console.error(prefixedMessage, ...params);

		this.appendLogLine(prefixedMessage, ...params);
	}
}

export class Utils {

	static sendDMtoOwner(client: Client, message: string): void {
		client.users.fetch(config.ownerId).then(owner => {
			owner.send(message);
		})
	}

	static async hasPermission(message: Message, permissionLevel: Permission): Promise<boolean> {
		const authorId = message.author.id;

		if (message.guild !== null && message.guild.available !== false) {
			const guildMember = await message.guild.members.fetch(authorId);

			switch (permissionLevel) {
				case Permission.OWNER:
					return authorId === config.ownerId;
				case Permission.ADMINISTRATOR:
					return guildMember.permissions.has("ADMINISTRATOR");
				case Permission.MODERATOR:
					return guildMember.permissions.has("MANAGE_CHANNELS");
				case Permission.USER:
					return true;
				default:
					return false;
			}
		}
		else {
			//Guild is not available we only check for owner level permission
			if (permissionLevel == Permission.OWNER)
				return authorId === config.ownerId;
			else 
				return true;
		}
	}

	static getFilenameFromURL(url: string): string {
		const splitUrl = url.split('/');
		return splitUrl[splitUrl.length - 1];
	}

	static updateBotStatus(client: Client, devMode: boolean): void {
		// Set the bot status
		if(devMode) {
			client.user.setPresence({
				status: 'dnd',
				afk: false,
				activity: {
					name: ' with Davoleo in VSCode',
					type: 'PLAYING',
				},
			});
		}
		else {
			client.user.setPresence({
				status: 'online',
				afk: false,
				activity: {
					name: ' for updates on CF',
					type: 'WATCHING',
				},
			});
		}
	}
}