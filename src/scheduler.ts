import { CachedProject } from "@prisma/client";
import { APIEmbed, GuildChannel, MessagePayload, Snowflake } from "discord.js";
import { CurseHelper } from "./curseHelper";
import CacheManager from "./data/CacheManager";
import { DBHelper } from "./data/dataHandler";
import ServerManager from "./data/ServerManager";
import { buildModEmbed } from "./embedBuilder";
import { botClient, logger } from "./main";
import Environment from "./model/Environment";
import ModData from "./model/ModData";
import { Utils } from "./util/discord";

export const SCHEDULER_TRANSACTION_ID = '$SCHEDULER_TRANSACTION$';

// -------------------------- Scheduled Check --------------------------------------

async function queryCacheUpdates(): Promise<Map<number, ModData>> {

	const projects: CachedProject[] = await CacheManager.getAllProjects();

	const updatedProjects: Map<number, ModData> = new Map();

	let anyUpdated = false;

	for(const project of projects) {
		//logger.info('Checking project: ' + project.id);
		const data = await CurseHelper.queryModById(project.id);

		if (project.version !== data.latestFile.fileName) {
			CacheManager.editProjectVersion(SCHEDULER_TRANSACTION_ID, project.id, data.latestFile.fileName);
			updatedProjects.set(project.id, data);
			anyUpdated = true;
		}
	}

	//Run cached project updates
	if (anyUpdated)
		DBHelper.runTransaction(SCHEDULER_TRANSACTION_ID);

	return updatedProjects;
}

function sendUpdateAnnouncements(channelId: Snowflake, announcements: APIEmbed[], message: string | null = null) {
	botClient.channels.fetch(channelId)
		.then((channel) => {
			if (channel instanceof GuildChannel) {
				if (channel.isTextBased() || channel.isThread()) {
					const payload = MessagePayload.create(channel, {
						content: message ?? undefined,
						embeds: announcements
					})

					return channel.send(payload);
				}
			}

			throw "Couldn't send update announcements in channel " + channel?.toString();
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

			const embeds: APIEmbed[] = [];
			filteredUpdates.forEach(update => {
				if (update !== null)
					embeds.push(buildModEmbed(update).data);
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
	
	}, 1000 * 60);
	// 15 Minutes
	
	
	setInterval(() => {
		Utils.updateBotStatus(botClient.user!, Environment.get().DevMode);
	}, 1000 * 60 * 60)
	// 1 Hour
}