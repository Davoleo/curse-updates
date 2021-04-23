import { Message } from "discord.js";
import { GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission } from "../../utils";
import { devMode } from "../../data/config.json"

function run(args: string[], messageRef: Message) {
    if(devMode) {
        //an argument has been passed
        if (args[0] !== undefined) {
            const category =  args.join(' ');
            GuildHandler.setTemplateMessage(messageRef.guild.id, category);
            return 'The template message has been set to: ```' + category + '```';
        }  
        else {
            GuildHandler.setTemplateMessage(messageRef.guild.id, "");
            return 'The template message has been reset to: ""';
        }
    }
    else {
        return "This feature is momentarily disabled due to it not working correctly, sorry for the inconvenience!"
    }
}

export const comm: Command = new Command(
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