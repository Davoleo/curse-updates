import { Message } from "discord.js";
import { GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { CommandPermission } from "../../utils";

function run(args: string[], messageRef: Message) {
    
    if (args[0].indexOf('<#') === -1)
        return ':x: The provided channel reference is invalid!';
    let channelId = args[0].replace('<#', '');
    channelId = channelId.replace('>', '');

    if (channelId.length > 0) {
        GuildHandler.setReleseChannel(messageRef.guild.id, channelId);
        return ':white_check_mark: Scheduled projects announcements will start to appear in <#' + channelId + '> once a new project update is published!';
    }
    else {
        return ':x: The provided channel reference is invalid!';
    }
}

export const comm = {
    name: 'setchannel', 
    data: {
        category: "schedule",
        description: 'Sets the channel this command is sent to as the projects update annoucements channel of the current server',
        isGuild: true,
        action: run,
        permLevel: CommandPermission.MODERATOR,
        argNames: ["channel"],
        async: false
    }
};