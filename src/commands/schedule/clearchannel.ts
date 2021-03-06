import { Message } from "discord.js";
import { GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
	GuildHandler.resetReleaseChannel(messageRef.guild.id);
	return 'Scheduled update channel has been set to "None", Update annoucements have been disabled on this server';
}

export const comm: Command = new Command(
    'clearchannel', 
    {
        category: "schedule",
        description: 'Resets the projects update annoucements channel of the current server to "None" (no further updates will be posted) [can be used anywhere in the server]',
        isGuild: true,
        action: run,
        permLevel: Permission.MODERATOR,
        argNames: [],
        async: false
    }
);