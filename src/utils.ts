import { Client, Message, StringResolvable } from 'discord.js';
import { appendFile, writeFile } from 'fs';

///The different levels of permission that may be needed to execute a certain command
export enum Permission {
    USER,
    MODERATOR,
    ADMINISTRATOR,
    DAVOLEO
}

//TODO Fix file param printing
export class Logger {

	private filename: string;

	constructor(filename: string) {
		this.filename = filename;
		writeFile(filename, "", 
			(error) => console.log(error ? "Error while creating the file" : "Log file was created successfully")
		);
	}

	private appendLogLine(line: string): void {
		appendFile(this.filename, line, (error) => {
			if (error) {
				console.error("Error while writing to " + this.filename +  ": ", error);
			}
		})
	}

	public info(message: string, ...params: StringResolvable[]): void {
		const prefixedMessage = "[INFO] curse_updates: " + message;
		console.log(prefixedMessage, ...params);

		params.forEach(param => message += (", " + JSON.stringify(param)));
		this.appendLogLine(prefixedMessage + '\n');
	}

	public warn(message: string, ...params: StringResolvable[]): void {
		const prefixedMessage = "[WARN] curse_updates: " + message;
		console.warn(prefixedMessage, ...params);

		params.forEach(param => message += (", " + JSON.stringify(param)));
		this.appendLogLine(prefixedMessage + '\n');
	}

	public error(message: string, ...params: StringResolvable[]): void {
		const prefixedMessage = "[ERROR] curse_updates: " + message;
		console.error(prefixedMessage, ...params);

		params.forEach(param => message += (", " + JSON.stringify(param)));
		this.appendLogLine(prefixedMessage + '\n');
	}
}

export class Utils {

	static sendDMtoDavoleo(client: Client, message: string): void {
		client.users.fetch('143127230866915328')
			.then((davoleo) => davoleo.send(message));
	}

	static async hasPermission(message: Message, permissionLevel: Permission): Promise<boolean> {
		if (message.guild !== null && message.guild.available !== false) {
			const authorId = message.author.id;
			const guildMember = await message.guild.members.fetch(authorId);

			switch (permissionLevel) {
				case Permission.DAVOLEO:
					return authorId === '143127230866915328';
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

		return false;
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