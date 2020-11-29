import * as cf from 'mc-curseforge-api';
import { MessageEmbed, Snowflake, Client, EmbedFieldData, Message } from 'discord.js';
import * as configJson from './cfg.json';
import { BotConfig } from './model/BotConfig';
import { Mod } from '../typings/mc-curseforge-api/objects/Mod';
import { ModFile } from '../typings/mc-curseforge-api/objects/Files';

const config: BotConfig = Object.assign(configJson);

///The different levels of permission that may be needed to execute a certain command
export enum Permission {
    USER,
    MODERATOR,
    ADMINISTRATOR,
    DAVOLEO
}

export class Utils {

	static async buildScheduleEmbed(guildId: Snowflake, client: Client): Promise<MessageEmbed> {
		const idNamePairs: EmbedFieldData[] = [];

		config.serverConfig[guildId].projects.forEach(project => {
			idNamePairs.push({name: project.id, value: project.version});
		});

		const embed = new MessageEmbed();
		embed.color = embedColors[Math.ceil((Math.random() * 3))];
		embed.setTitle('Registered Projects and Release Channel for this server');

		const releasesChannelId = config.serverConfig[guildId].releasesChannel;

		let channel = null;
		if (releasesChannelId != '-1') {
			channel = await client.channels.fetch(releasesChannelId);
		}

		if (channel !== null) {
			embed.addField('Announcements Channel', channel.toString());
		}
		else {
			embed.addField('Announcements Channel', 'None');
		}

		const messageTemplate = config.serverConfig[guildId].messageTemplate;
		if (messageTemplate !== '') {
			embed.addField('Template Message', messageTemplate);
		}
		else {
			embed.addField('Template Messsage', 'None');
		}

		if (idNamePairs.length > 0) {
			embed.addFields(idNamePairs);
		}
		else {
			embed.setTitle('No Projects have been Scheduled on this server');
		}

		return embed;
	}

	static sendDMtoDavoleo(client: Client, message: string): void {
		client.users.fetch('143127230866915328')
			.then((davoleo) => davoleo.send(message));
	}

	static async hasPermission(message: Message, permissionLevel: Permission): Promise<boolean> {
		if (message.guild !== null && message.guild.available !== false) {
			const authorId = message.author.id;
			const guildMember = await message.guild.members.fetch(authorId);

			switch (permissionLevel) {
				case Permission.DAVOLEO:
					return authorId === '143127230866915328';
				case Permission.ADMINISTRATOR:
					return guildMember.permissions.has("ADMINISTRATOR");
				case Permission.MODERATOR:
					return guildMember.permissions.has("MANAGE_CHANNELS");
				case Permission.USER:
					return true;
				default:
					return false;
			}
		}

		return false;
	}
}