import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';

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
		
		this.filename = "logs/" + Logger.getCurrentDateTime().replace(/[/:]/g, '-') + "_bot.log";
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