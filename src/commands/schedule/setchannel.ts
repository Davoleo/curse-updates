import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[], messageRef: Message) {
    
    if (args[0].indexOf('<#') === -1)
        return 'The provided channel reference is invalid!';
    let channelId = args[0].replace('<#', '');
    channelId = channelId.replace('>', '');

    if (channelId.length > 0) {
        fileUtils.saveReleasesChannel(messageRef.guild.id, channelId);
        return 'Scheduled projects announcements will start to appear in <#' + channelId + '> once a new project update is published!';
    }
    else {
        return 'The provided channel reference is invalid!';
    }
}

export const ping: Command = new Command(
    'setchannel', 
    {
        category: "schedule",
        description: 'Sets the channel this command is sent to as the projects update annoucements channel of the current server',
        isGuild: true,
        action: run,
        permLevel: Permission.MODERATOR,
        argNames: ["channel"],
        async: false
    }
);