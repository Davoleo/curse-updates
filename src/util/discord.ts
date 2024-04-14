import {Snowflake} from 'discord-api-types/globals';
import {
	ActivityType,
	Client,
	ClientUser,
	MessageCreateOptions,
	PermissionFlagsBits,
	PermissionsBitField
} from 'discord.js';
import Environment from './Environment.js';

///The different levels of permission that may be needed to execute a certain command
export enum CommandPermission {
    USER,
    MODERATOR,
    ADMINISTRATOR,
    OWNER
}

const env = Environment.get();
export class Utils {


	static sendDMtoBotOwner(client: Client, message: string | MessageCreateOptions): void {
		//if no bot owner is provided -> disable DM notifications
		if (!env.OwnerId)
			return;

		client.users.fetch(env.OwnerId).then(owner => {
			void owner.send(message);
		});
	}

	static hasPermission(authorId: Snowflake, discordPermissions: Readonly<PermissionsBitField> | null, permissionLevel: CommandPermission): boolean {

		//Guild is not available we only check for owner level permission
		if (discordPermissions === null) {
			if (permissionLevel == CommandPermission.OWNER)
				return env.OwnerId ? (authorId === env.OwnerId) : false;
			else
				return true;
		}

		switch (permissionLevel) {
			case CommandPermission.OWNER:
				return env.OwnerId ? (authorId === env.OwnerId) : false;
			case CommandPermission.ADMINISTRATOR:
				return discordPermissions.has(PermissionFlagsBits.ManageGuild, true) || discordPermissions.has(PermissionFlagsBits.ManageRoles, true);
			case CommandPermission.MODERATOR:
				return discordPermissions.has(PermissionFlagsBits.ManageMessages);
			case CommandPermission.USER:
				return true;
			default:
				return false;
		}
	}

	static updateBotStatus(botUser: ClientUser, devMode: boolean): void {
		// Set the bot status
		botUser.setPresence({
			status: devMode ? 'dnd' : 'online',
			afk: false,
			activities: [
				{
					name: devMode ? ' with my owner in Dev Mode' : ' for updates on CF',
					type: devMode ? ActivityType.Playing : ActivityType.Watching,
				}
			],
		});
	}
}