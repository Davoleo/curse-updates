// -------------------------- Scheduled Check --------------------------------------

async function queryCacheUpdates(): Promise<Map<number, MessageEmbed>> {

	const projects: CachedProject[] = await CacheManager.getAllProjects();

	const updatedProjects: Map<number, MessageEmbed> = new Map();

	for(const project of projects) {
		//logger.info('Checking project: ' + project.id);
		const data = await CurseHelper.queryModById(project.id);

		if (project.version !== data.latestFile.fileName) {
			const embed = buildModEmbed(data);
			CacheManager.editProjectVersion(project.id, data.latestFile.fileName);
			updatedProjects.set(project.id, embed);
		}
	}

	return updatedProjects;
}

async function sendUpdateAnnouncements(updates: Map<number, MessageEmbed>) {
	
	const guilds = GuildHandler.getAllServerConfigs();

	for (const guild of guilds) {
		try {
			if (guild.releasesChannel !== '-1') {
				const channel: TextChannel = await botClient.channels.fetch(guild.releasesChannel) as TextChannel;
				//logger.info('Will send the message in: ' + channel.name)

				for (const id of guild.projectIds) {
					const embed = updates.get(id);

					if (guild.messageTemplate !== '') {
						await channel.send(guild.messageTemplate);
					}
					if (embed != undefined) {
						await channel.send("NOT IMPLEMENTED YET!!" /*embed*/);
					}
				}
			}
		}
		catch(error) {
			if (error == "DiscordAPIError: Missing Access" || error == "DiscordAPIError: Unknown Channel") {
				const discordGuild = await botClient.guilds.fetch(guild.serverId);
				
				botClient.users.fetch(discordGuild.ownerId)
				.then(owner => {
					owner.send("CHANNEL ACCESS ERROR - Resetting the annoucement channel for your server: " + discordGuild.name + "\nPlease Give the bot enough permission levels to write in the annoucements channel.")
				})
				Utils.sendDMtoBotOwner(botClient, "CHANNEL ACCESS ERROR - Resetting the annoucement channel for server: " + discordGuild.name + ` (${discordGuild.id})`);
				
				GuildHandler.resetReleaseChannel(discordGuild.id);
			}
			else {
				Utils.sendDMtoBotOwner(botClient, 'Error sending mod update information in one of the guilds: ' + error);
				logger.warn('WARNING: A promise was rejected!', error);
			}
		}
	}
}

/*
setInterval(() => {
	queryCacheUpdates()
	.then(updates => {
		if (updates.size > 0) {
			sendUpdateAnnouncements(updates);
		}
	})
	.catch(error => logger.error("There was an error when querying cached projects: ", error));

}, 1000 * 60 * 15);
// 15 Minutes
*/

setInterval(() => {
	Utils.updateBotStatus(botClient, Environment.get().DevMode);
}, 1000 * 60 * 60)
// 1 Hour