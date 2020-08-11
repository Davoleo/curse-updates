const { Utils } = require('./utils');
const config = require('../cfg.json');
const fs = require('fs');

module.exports = {
	savePrefix(prefix) {
		config.prefix = prefix;
		this.updateJSONConfig();
	},

	async addProjectToConfig(guildId, projectId) {
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
			}
			else {
				return 'This project was already in the bot schedule!';
			}

			this.updateJSONConfig();
			return 'Project was added successfully';
		}
		else {
			return 'There was an issue adding this project to the schedule';
		}
	},

	removeProjectFromConfig(guildId, projectId) {
		let found = false;
		const projectsArray = config.serverConfig[guildId].projects;

		projectsArray.forEach((projectObj) => {
			if (projectObj.id === projectId) {
				found = true;
				const indexOfProject = projectsArray.indexOf(projectObj);
				projectsArray.splice(indexOfProject, 1);
				this.updateJSONConfig();
			}
		});

		return found ? 'Project was removed successfully' : 'The project you want to remove is not part of the scheduled check';
	},

	clearSchedule(guildId) {
		config.serverConfig[guildId].projects = [];
		this.updateJSONConfig();
	},

	updateCachedProject(guildId, projectId, newVersion) {
		if (config.serverConfig[guildId].projects.length > 0) {
			config.serverConfig[guildId].projects.forEach((project) => {
				if (project.id === projectId) {
					project.version = newVersion;
					this.updateJSONConfig();
				}
			});
		}
	},

	saveReleasesChannel(guildId, channelId) {
		config.serverConfig[guildId].releasesChannel = channelId;
		this.updateJSONConfig();
	},

	resetReleasesChannel(guildId) {
		config.serverConfig[guildId].releasesChannel = -1;
		this.updateJSONConfig();
	},

	setTemplateMessage(guildId, message) {
		config.serverConfig[guildId].messageTemplate = message;
		this.updateJSONConfig();
	},

	initSaveGuild(id) {
		if(!(id in config.serverConfig)) {
			console.log('GUILD INIT');
			config.serverConfig[id] = {
				releasesChannel: -1,
				messageTemplate: '',
				projects: [],
			};
			this.updateJSONConfig();
		}
	},

	updateJSONConfig() {
		fs.writeFile('./cfg.json', JSON.stringify(config, null, 2), function writeJSON(e) {
			if (e) {
				return console.log(e);
			}
		});
	},
};