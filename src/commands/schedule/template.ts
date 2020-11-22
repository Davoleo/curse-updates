import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[], messageRef: Message) {
    fileUtils.setTemplateMessage(messageRef.guild.id, args[0]);

    if (args[0] !== '')
        return 'The template message has been set to: ```' + args[0] + '```';
    else
        return 'The template message has been reset to: ""';
}

export const ping: Command = new Command(
    'template', 
    {
        category: "schedule",
        description: 'Sets a template message that is sent together with the update embed once a project update is released (empty template will reset this setting)',
        isGuild: true,
        action: run,
        permLevel: Permission.MODERATOR,
        argNames: ["announcementMessage"],
        async: false
    }
);