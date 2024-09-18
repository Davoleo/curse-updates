import {CachedProject} from "@prisma/client";
import {APIEmbed, DiscordAPIError, GuildChannel, Snowflake} from "discord.js";
import {CurseHelper} from "./curseHelper.js";
import {DBHelper} from "./data/dataHandler.js";
import {buildModEmbed} from "./discord/embedBuilder.js";
import {botClient} from "./main.js";
import Environment from "./util/Environment.js";
import ModData from "./model/ModData.js";
import {Utils} from "./util/discord.js";
import CacheService from "./services/CacheService.js";
import GuildService from "./services/GuildService.js";
import GameTag from "./model/GameTag.js";
import {Logger} from "./util/log.js";

export const SCHEDULER_CLEANUP_TRANSACTION = '$SCHEDULER_CLEANUP_TRANSACTION$';
export const SCHEDULER_TRANSACTION_ID = '$SCHEDULER_TRANSACTION$';

// -------------------------- Scheduled Check --------------------------------------

async function queryCacheUpdates(): Promise<ModData[]> {

	const projects: CachedProject[] = await CacheService.getAllProjects()

	// project cache cleanup
	let anyCleanedUp = false;
	for (const project of projects) {
		const cleaned = await CacheService.cleanupProject(project.id, SCHEDULER_CLEANUP_TRANSACTION);
		anyCleanedUp ||= cleaned;
	}
	if (anyCleanedUp) {
		Logger.I.info("cleaning up cache...");
		await DBHelper.runTransaction(SCHEDULER_CLEANUP_TRANSACTION);
	}

	const projectIds = projects.map(proj => proj.id).sort();
	const curseData = await CurseHelper.queryMods(projectIds)

	const updates: ModData[] = [];

	for(const updateData of curseData) {

		const mod = updateData.mod;

		if (mod) {
			Logger.I.debug("Project '" + mod.name + "': Checking for updates...");
			const project = projects.filter(proj => proj.id === mod.id).pop();

			if (!project) {
				Logger.I.error("Received update for a project that is not in the Cache..?? projId: " + mod.id);
				continue;
			}

			const latestFile = updateData.latestFile;

			//if the updated project doesn't have files or the file id is the same as the cached one -> Remove from schedule
			if (!latestFile || project.fileId === latestFile.id) {
				Logger.I.debug("skipping ... " + (!latestFile ? "Missing latestFile" : (project.fileId === latestFile.id ? "No New Version" : "WTF??")))
				continue;
			}

			if (project.fileId != latestFile.id) {
				Logger.I.info("Project '" + project.filename + "': found update '" + latestFile.fileName + "'");
				CacheService.editProjectVersion(SCHEDULER_TRANSACTION_ID, project.id, { id: latestFile?.id, filename: latestFile?.fileName })
				updateData.latestChangelog = await latestFile.get_changelog();
				updates.push(updateData);
			}
		}
	}

	//Run cached project updates
	if (updates.length > 0)
		await DBHelper.runTransaction(SCHEDULER_TRANSACTION_ID);

	return updates;
}

async function sendUpdateAnnouncements(channelId: Snowflake, announcements: APIEmbed[], message: string | null = null) {

	try {
		const channel = await botClient.channels.fetch(channelId);

		if (channel instanceof GuildChannel) {
			if (channel.isTextBased() || channel.isThread()) {
				for (const embed of announcements) {
					await channel.send({
						content: message ?? undefined,
						embeds: [embed]
					});
				}
			}
		}
	}
	catch (err) {
		Logger.I.error(`[scheduler.ts] ${err.name}: ${err.message} \n\n ${err?.stack}`);
		Utils.sendDMtoBotOwner(botClient, `[scheduler.ts] ${err.name}: ${err.message}`);
		if (err instanceof DiscordAPIError) {
			Logger.I.error(`[scheduler.ts] [DiscordDetails] channel:${channelId} \n\nbody:\n${err.requestBody}`)
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseModProperties(text: string, modInfo: ModData[]) {
	//TODO Implement
	//const properties: string[] = [];

}

async function prepareSendAnnouncements(updates: ModData[]) {
	
	const guilds = await GuildService.getAllServerConfigs();

	for (const guild of guilds) {

		const guildUpdates =
			guild.projects.map((proj) => updates
				.filter(update => update.mod.id == proj.id)
				.pop()
			);

		if (guildUpdates.length === 0) {
			//no project updates for this guild
			continue;
		}

		for (const updateConfig of guild.announcementConfigs) {
			if (updateConfig === null || updateConfig.channel === null)
				continue;

			const filteredUpdates = guildUpdates.filter((update) => {

				//If the update for some reason doesn't contain any info -> skip it
				if (!update)
					return false;

				let keep = true;

				//If projects filter is enabled and none of the entries includes the current update project
				//we set remove to true for this project
				if (updateConfig.projectsFilter !== null) {
					keep &&= updateConfig.projectsFilter.includes(update.mod.id.toString())
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

					//keep if it wasn't discarded previously and at least one of the tags in the config is matched
					keep &&= anyMatches;
				}

				return keep;
			});

			if (filteredUpdates.length === 0) {
				//no project updates for this config after filtering work
				continue;
			}

			const preprocessedMessage = updateConfig.message;
			//TODO Implement
			// if (preprocessedMessage !== null) {
			// 	//parseModProperties(preprocessedMessage, [])
			// }

			const embeds = filteredUpdates.map(update => buildModEmbed(update!).data);

			await sendUpdateAnnouncements(updateConfig.channel, embeds, preprocessedMessage);
		}
	}
}


export function initScheduler() {
	Logger.I.info("Update checker initializing...")
	setInterval(() => {
		Logger.I.info("Scheduler now checking for updates...")
		queryCacheUpdates()
		.then(updates => {
			if (updates.length > 0) {
				return prepareSendAnnouncements(updates);
			}
			return Promise.resolve();
		})
		.catch(error => Logger.I.error("There was an error when querying cached projects: ", error));
	
	}, 1000 * 15 * 60);
	// 15 Minutes
	
	
	setInterval(() => {
		Utils.updateBotStatus(botClient.user!, Environment.get().DevMode);
	}, 1000 * 60 * 60)
	// 1 Hour
}