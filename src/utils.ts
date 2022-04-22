import { Snowflake } from 'discord-api-types/globals';
import { Client, ClientUser, Permissions } from 'discord.js';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import Environment from './model/Environment';

///The different levels of permission that may be needed to execute a certain command
export enum CommandPermission {
    USER,
    MODERATOR,
    ADMINISTRATOR,
    OWNER
}

enum LogLevel {
	ERROR,
	WARN,
	INFO
}

export class Logger {

	private filename: string;
	private logStream: WriteStream;

	constructor() {
		if (!existsSync("logs"))
			mkdirSync("logs");
		
		this.filename = "logs/" + Logger.getCurrentDateTime().replace(/\/|:/g, '-') + "_bot.log";		
		this.logStream = createWriteStream(this.filename, { autoClose: true });
		console.log("Logger Initialized");
		
	}

	private appendLogLine(line: string, ...extras: unknown[]): void {
		this.logStream.write(line + '\n', (error) => {
			if (error)
				console.error("Error while writing to " + this.filename +  ": ", error);
		});
		if (extras.length > 0)
			this.logStream.write(JSON.stringify(extras) + '\n');
	}

	private static getCurrentDateTime(): string {
		const now = new Date();
		return now.toLocaleDateString('en-GB') + '_' + now.toLocaleTimeString('en-GB');
	}

	private log(level: LogLevel, message: string, ...params: string[]): void {
		const prefixedMessage = `[${Logger.getCurrentDateTime()}] [${LogLevel[level]}] curse_updates: ${message}`;
		switch(level) {
			case LogLevel.ERROR:
				console.error(prefixedMessage, ...params);
			break;
			case LogLevel.WARN:
				console.warn(prefixedMessage, ...params);
			break;
			case LogLevel.INFO:
				console.log(prefixedMessage, ...params);
			break;
		}

		this.appendLogLine(prefixedMessage, ...params);
	}

	public info(message: string, ...params: string[]): void {
		this.log(LogLevel.INFO, message, ...params);
	}

	public warn(message: string, ...params: string[]): void {
		this.log(LogLevel.WARN, message, ...params);
	}

	public error(message: string, ...params: string[]): void {
		this.log(LogLevel.ERROR, message, ...params);
	}
}

const env = Environment.get();
export class Utils {


	static sendDMtoBotOwner(client: Client, message: string): void {
		client.users.fetch(env.OwnerId).then(owner => {
			owner.send(message);
		});
	}

	static hasPermission(authorId: Snowflake, discordPermissions: Permissions | null, permissionLevel: CommandPermission): boolean {

		//Guild is not available we only check for owner level permission
		if (discordPermissions === null) {
			if (permissionLevel == CommandPermission.OWNER)
				return authorId === env.OwnerId;
			else
				return true;
		}

		switch (permissionLevel) {
			case CommandPermission.OWNER:
				return authorId === env.OwnerId;
			case CommandPermission.ADMINISTRATOR:
				return discordPermissions.has("MANAGE_GUILD", true) || discordPermissions.has("MANAGE_ROLES", true);
			case CommandPermission.MODERATOR:
				return discordPermissions.has("MANAGE_MESSAGES");
			case CommandPermission.USER:
				return true;
			default:
				return false;
		}
	}

	static updateBotStatus(botUser: ClientUser, devMode: boolean): void {
		// Set the bot status
		botUser.setPresence({
			status: devMode ? 'dnd' : 'online',
			afk: false,
			activities: [
				{
					name: devMode ? ' with Davoleo in VSCode' : ' for updaes on CF',
					type: devMode ? 'PLAYING' : 'WATCHING',
				}
			],
		});
	}
}