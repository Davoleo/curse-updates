import {createWriteStream, existsSync, mkdirSync, WriteStream} from 'fs';
import Environment from "./Environment.js";

export enum LogLevel {
	ERROR,
	WARN,
	INFO,
	DEBUG,
}

export type LogLevelNames = keyof typeof LogLevel;

const format = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
});

export class Logger {

	private static _INSTANCE: Logger;

	private readonly filename: string;
	private logStream: WriteStream;
	private _level: LogLevel;

	constructor(lowestLevel: LogLevel) {
		if (!existsSync("logs"))
			mkdirSync("logs");
		
		this.filename = "logs/" + Logger.getCurrentDateTime().replace(/[/:]/g, '-') + "_bot.log";
		this.logStream = createWriteStream(this.filename, { autoClose: true });
		this._level = lowestLevel;
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

	public static get I(): Logger {
		if (!this._INSTANCE) {
			this._INSTANCE = new Logger(Environment.get().LogLevel)
		}
		return this._INSTANCE;
	}

	private static getCurrentDateTime(): string {
		const now = new Date();
		const parts =  format.formatToParts(now);
		return `${parts[4].value}-${parts[2].value}-${parts[0].value}_${parts[6].value}-${parts[8].value}-${parts[10].value}`;
	}

	public static logLevelByName(levelName: LogLevelNames | undefined): LogLevel | null {
		if (levelName === undefined)
			return null;

		switch (levelName) {
			case "ERROR":
				return LogLevel.ERROR;
			case "WARN":
				return LogLevel.WARN;
			case "INFO":
				return LogLevel.INFO;
			case "DEBUG":
				return LogLevel.DEBUG;
			default:
				console.warn("LogLevel in .env file is invalid! Please choose one of the following values: ERROR, WARN, INFO, DEBUG")
				console.warn("using default level DEBUG for this run")
				return null;
		}
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
				console.info(prefixedMessage, ...params);
				break;
			case LogLevel.DEBUG:
				console.debug(prefixedMessage, ...params);
				break;
		}

		if (level <= this._level) {
			this.appendLogLine(prefixedMessage, ...params);
		}
	}


	public set level(value: LogLevel) {
		this._level = value;
	}

	public get level(): LogLevel {
		return this._level;
	}

	public debug = (message: string, ...params: string[]): void => {
		this.log(LogLevel.DEBUG, message, ...params);
	};

	public info = (message: string, ...params: string[]): void => {
		this.log(LogLevel.INFO, message, ...params);
	};

	public warn = (message: string, ...params: string[]): void => {
		this.log(LogLevel.WARN, message, ...params);
	};

	public error = (message: string, ...params: string[]): void => {
		this.log(LogLevel.ERROR, message, ...params);
	};
}