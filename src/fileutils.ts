import { Utils } from './utils';
import * as configJson from './cfg.json';
import * as fs from 'fs';
import { Snowflake } from 'discord.js';
import { BotConfig } from './model/BotConfig';

const config: BotConfig = Object.assign(configJson);

export default {
	updateJSONConfig(newConfig: BotConfig): void {
		fs.writeFile('./cfg.json', JSON.stringify(newConfig, null, 2), function writeJSON(e) {
			if (e) {
				console.log(e);
			}
		});
	},

	savePrefix(prefix: string): void {
		const newConfig = config;
		newConfig.prefix = prefix;
		this.updateJSONConfig(newConfig);
	},

	async addProjectToConfig(guildId: Snowflake, projectId: number): Promise<string> {
		const embed = await Utils.queryLatest(projectId);
		const serverProjects = config.serverConfig[guildId].projects;

		// console.log(embed);
		if (embed !== null) {
			const latestFileName = embed.fields[2].value;

			let found = false;
			for (const project of serverProjects) {
				if (project.id === projectId) {
					found = true;
				}
			}

			if (!found) {
				serverProjects.push({ id: projectId, version: latestFileName });
				//TODO: send the first update right when you add the project if a channel was already set
			}
			else {
				return 'This project was already in the bot schedule!';
			}

			this.updateJSONConfig(config);
			return 'Project was added successfully';
		}
		else {
			return 'There was an issue adding this project to the schedule';
		}
	},

	removeProjectFromConfig(guildId: Snowflake, projectId: number): string {
		let found = false;
		const projectsArray = config.serverConfig[guildId].projects;

		projectsArray.forEach((projectObj) => {
			if (projectObj.id === projectId) {
				found = true;
				const indexOfProject = projectsArray.indexOf(projectObj);
				projectsArray.splice(indexOfProject, 1);
				this.updateJSONConfig(config);
			}
		});

		return found ? 'Project was removed successfully' : 'The project you want to remove is not part of the scheduled check';
	},

	clearSchedule(guildId: Snowflake): void {
		config.serverConfig[guildId].projects = [];
		this.updateJSONConfig(config);
	},

	updateCachedProject(guildId: Snowflake, projectId: number, newVersion: string): void {
		if (config.serverConfig[guildId].projects.length > 0) {
			config.serverConfig[guildId].projects.forEach((project) => {
				if (project.id === projectId) {
					project.version = newVersion;
					this.updateJSONConfig(config);
				}
			});
		}
	},

	saveReleasesChannel(guildId: Snowflake, channelId: Snowflake): void {
		config.serverConfig[guildId].releasesChannel = channelId;
		this.updateJSONConfig(config);
	},

	resetReleasesChannel(guildId: Snowflake): void {
		config.serverConfig[guildId].releasesChannel = '-1';
		this.updateJSONConfig(config);
	},

	setTemplateMessage(guildId: Snowflake, message: string): void {
		config.serverConfig[guildId].messageTemplate = message;
		this.updateJSONConfig(config);
	},

	initSaveGuild(id: Snowflake): void {
		if(!(id in config.serverConfig)) {
			console.log('GUILD INIT');
			config.serverConfig[id] = {
				releasesChannel: '-1',
				messageTemplate: '',
				projects: [],
			};
			this.updateJSONConfig(config);
		}
	},

	clearGuild(id: Snowflake): boolean {
		if (id in config.serverConfig) {
			delete config.serverConfig.id;
			this.updateJSONConfig(config)
			return true;
		}
		else return false;
	}
};