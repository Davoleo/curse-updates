import { Client, Message } from 'discord.js';

///The different levels of permission that may be needed to execute a certain command
export enum Permission {
    USER,
    MODERATOR,
    ADMINISTRATOR,
    DAVOLEO
}

export class Utils {

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

	static getFilenameFromURL(url: string): string {
		const splitUrl = url.split('/');
		return splitUrl[splitUrl.length - 1];
	}
}