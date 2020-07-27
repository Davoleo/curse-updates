const { Utils } = require('./utils');
const config = require('../cfg.json');
const fs = require('fs');

module.exports = {
	savePrefix(prefix) {
		config.prefix = prefix;
		this.updateJSONConfig();
	},

	addProjectToConfig(guildId, projectId) {
		Utils.queryLatest(projectId).then(embed => {
			// console.log(embed);
			if (embed !== null) {
				const latestFileName = embed.fields[2].value;
				config.serverConfig[guildId].projects.push({ id: projectId, version: latestFileName });
				this.updateJSONConfig();
				return 'Project was added successfully';
			}
			else {
				return 'There was an issue adding that project to the schedule';
			}
		});
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

	initSaveGuild(id) {
		if(!(id in config.serverConfig)) {
			console.log('GUILD INIT');
			config.serverConfig[id] = {
				releasesChannel: -1,
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