import { Message } from "discord.js";
import { GuildHandler } from "../../data/dataHandler";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(args: string[], messageRef: Message) {
    
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