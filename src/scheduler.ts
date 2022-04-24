import { CachedProject } from "@prisma/client";
import { MessageEmbed, MessageOptions, Snowflake, TextBasedChannel } from "discord.js";
import { CurseHelper } from "./curseHelper";
import CacheManager from "./data/CacheManager";
import ServerManager from "./data/ServerManager";
import { buildModEmbed } from "./embedBuilder";
import { botClient, logger } from "./main";
import Environment from "./model/Environment";
import ModData from "./model/ModData";
import { Utils } from "./utils";

// -------------------------- Scheduled Check --------------------------------------

async function queryCacheUpdates(): Promise<Map<number, ModData>> {

	const projects: CachedProject[] = await CacheManager.getAllProjects();

	const updatedProjects: Map<number, ModData> = new Map();

	for(const project of projects) {
		//logger.info('Checking project: ' + project.id);
		const data = await CurseHelper.queryModById(project.id);

		if (project.version !== data.latestFile.fileName) {
			CacheManager.editProjectVersion(project.id, data.latestFile.fileName);
			updatedProjects.set(project.id, data);
		}
	}

	return updatedProjects;
}


function sendUpdateAnnouncements(channelId: Snowflake, announcements: MessageEmbed[], message: string | null = null) {
	botClient.channels.fetch(channelId)
	.then((channel: TextBasedChannel) => {
		const payload: MessageOptions = {
			embeds: announcements
		}
		if (message !== null)
			payload.content = message;

		return channel.send(payload);
	})
	.then((message) => {
		//TODO: log information
	})
	.catch((err: Error) => {
		logger.error("[scheduler.ts] " + err.name + ": " + err.message);
		Utils.sendDMtoBotOwner(botClient, `[scheduler.ts] ${err.name}: ${err.message}\n\n${err?.stack}`);
	})
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseModProperties(text: string, modInfo: ModData[]) {
	//TODO Implement
	//const properties: string[] = [];

}

async function prepareSendAnnouncements(updates: Map<number, ModData>) {
	
	const guilds = await ServerManager.all();

	for (const guild of guilds) {

		const announcements = await guild.getUpdateSettings();

		for (const updateConfig of announcements.config) {
			if (updateConfig === null || updateConfig.channel === null)
				continue;

			const filteredUpdates = Array.from(updates, (update) => {
				let remove = false;
				
				//If projects filter is enabled and none of the entries includes the current update project 
				//we set remove to true for this project
				if (updateConfig.projectsFilter !== null) {
					if (!updateConfig.projectsFilter.includes(update[0].toString()))
						remove = true;
				}

				//If gameVers filter is enabled and none of the current update gameVersions are in the filter
				//we set remove to true for this project
				if (updateConfig.gameVerFilter !== null) {
					const anyMatches = update[1].latestFile.gameVersions.some(gameVer => {
						return updateConfig.gameVerFilter!.includes(gameVer);
					});
					remove ||= !anyMatches;
				}

				//If the project was flagged to be removed we return null instead of it's update
				return remove ? null : update[1];
			});

			const preprocessedMessage = updateConfig.message;
			if (preprocessedMessage !== null) {
				//TODO Implement
				//parseModProperties(preprocessedMessage, [])
			}

			const embeds: MessageEmbed[] = [];
			filteredUpdates.forEach(update => {
				if (update !== null)
					embeds.push(buildModEmbed(update));
			});

			sendUpdateAnnouncements(updateConfig.channel, embeds);
		}
	}
}


export function initScheduler() {
	setInterval(() => {
		queryCacheUpdates()
		.then(updates => {
			if (updates.size > 0) {
				prepareSendAnnouncements(updates);
			}
		})
		.catch(error => logger.error("There was an error when querying cached projects: ", error));
	
	}, 1000 * 60 * 15);
	// 15 Minutes
	
	
	setInterval(() => {
		Utils.updateBotStatus(botClient.user!, Environment.get().DevMode);
	}, 1000 * 60 * 60)
	// 1 Hour
}