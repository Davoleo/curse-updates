import { Snowflake } from 'discord-api-types/globals';
import { ActivityType, Client, ClientUser, PermissionFlagsBits, Permissions, PermissionsBitField } from 'discord.js';
import Environment from '../model/Environment';

///The different levels of permission that may be needed to execute a certain command
export enum CommandPermission {
    USER,
    MODERATOR,
    ADMINISTRATOR,
    OWNER
}

const env = Environment.get();
export class Utils {


	static sendDMtoBotOwner(client: Client, message: string): void {
		client.users.fetch(env.OwnerId).then(owner => {
			owner.send(message);
		});
	}

	static hasPermission(authorId: Snowflake, discordPermissions: Readonly<PermissionsBitField> | null, permissionLevel: CommandPermission): boolean {

		//Guild is not available we only check for owner level permission
		if (discordPermissions === null) {
			if (permissionLevel == CommandPermission.OWNER)
				return authorId === env.OwnerId;
			else
				return true;
		}

		switch (permissionLevel) {
			case CommandPermission.OWNER:
				return authorId === env.OwnerId;
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
					name: devMode ? ' with my owner in Dev Mode' : ' for updaes on CF',
					type: devMode ? ActivityType.Playing : ActivityType.Watching,
				}
			],
		});
	}
}