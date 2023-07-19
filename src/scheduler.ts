import {CachedProject} from "@prisma/client";
import {APIEmbed, GuildChannel, MessagePayload, Snowflake} from "discord.js";
import {CurseHelper} from "./curseHelper";
import {DBHelper} from "./data/dataHandler";
import {buildModEmbed} from "./discord/embedBuilder";
import {botClient, logger} from "./main";
import Environment from "./util/Environment";
import ModData from "./model/ModData";
import {Utils} from "./util/discord";
import CacheService from "./services/CacheService";
import GuildService from "./services/GuildService";
import GameTag from "./model/GameTag";

export const SCHEDULER_TRANSACTION_ID = '$SCHEDULER_TRANSACTION$';

// -------------------------- Scheduled Check --------------------------------------

async function queryCacheUpdates(): Promise<Map<number, ModData>> {

	const projects: CachedProject[] = await CacheService.getAllProjects()
	const projectIds = projects.map(proj => proj.id)
	const curseData = await CurseHelper.queryMods(projectIds)

	let anyUpdated = false

	for(const project of projects) {
		const data = curseData.get(project.id)

		if (data) {
			const latest = data.latestFile;

			if (project.fileId != latest?.id) {
				CacheService.editProjectVersion(SCHEDULER_TRANSACTION_ID, project.id, { id: latest?.id, filename: latest?.fileName })
				anyUpdated = true
			}

			if (!latest || project.fileId === latest.id) {
				curseData.delete(project.id)
			}
		}
	}

	//Run cached project updates
	if (anyUpdated)
		DBHelper.runTransaction(SCHEDULER_TRANSACTION_ID);

	return curseData;
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
	
	const guilds = await GuildService.getAllServerConfigs();

	for (const guild of guilds) {

		for (const updateConfig of guild.announcementConfigs) {
			if (updateConfig === null || updateConfig.channel === null)
				continue;

			const filteredUpdates = Array.from(updates.values(), (update) => {
				let remove = false;
				
				//If projects filter is enabled and none of the entries includes the current update project 
				//we set remove to true for this project
				if (updateConfig.projectsFilter !== null) {
					if (!updateConfig.projectsFilter.includes(update.mod.id.toString()))
						remove = true;
				}

				//If gameVers filter is enabled and none of the current update gameVersions are in the filter
				//we set remove to true for this project
				if (updateConfig.tagsFilter !== null && update.latestFile) {
					const tags = updateConfig.tagsFilter.split('|').map(stag => GameTag.fromString(stag))


					const anyMatches = update.latestFile.gameVersions.some(version => {
						for (const tag of tags) {
							if (CurseHelper.GameSlugs.get(tag.game) === update.mod.gameId) {
								return tag.tag === version
							}
						}
						return false;
					});

					//remove if it was already flagged OR if tags filter doesn't produce any match
					remove ||= !anyMatches;
				}

				return remove ? null : update;
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