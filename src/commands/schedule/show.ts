
import { EmbedFieldData, Message, MessageEmbed, Snowflake } from "discord.js";
import { CacheHandler, GuildHandler } from "../../data/dataHandler";
import { embedColors } from "../../embedBuilder";
import Command from "../../model/Command";
import { CommandPermission } from "../../utils";

function run(args: string[], messageRef: Message) {
    const embeds = buildScheduleEmbed(messageRef.guild.id)

    if (embeds.extras === null) {
        return embeds.main;
    }
    else {
        messageRef.channel.send("Not Yet Implemented!!" /*embeds.main*/)
        return embeds.extras;
    }
}

export const comm: Command = new Command(
    'show', 
    {
        category: "schedule",
        description: 'Shows the scheduled project updates announcements of the current server and the announcements channel',
        isGuild: true,
        action: run,
        permLevel: CommandPermission.USER,
        argNames: [],
        async: false
    }
);

function buildScheduleEmbed(guildId: Snowflake): {main: MessageEmbed, extras: MessageEmbed} {
    const idNamePairs: EmbedFieldData[] = [];

    const config = GuildHandler.getServerConfig(guildId);

    config.projectIds.forEach(id => {
        const project = CacheHandler.getProjectById(id);
        if (project == null)
            return;
        idNamePairs.push({name: project.slug, value: 'id: ' + project.id + '\nlatest cached version: ' + project.version});
    });

    const embColor = embedColors[Math.ceil((Math.random() * 3))]

    //Discord Embed Field Limit is currently 25 so if the mod entries fields are over 23 we build a second embed containing the remaining projects
    let extraEmbed = null;
    if (idNamePairs.length > 23) {
        extraEmbed = new MessageEmbed();
        extraEmbed.setTitle("Scheduled Projects Page 2")
        extraEmbed.addFields(idNamePairs.slice(23));
        extraEmbed.color = embColor;
    }

    const embed = new MessageEmbed();
    embed.color = embedColors[Math.ceil((Math.random() * 3))];
    embed.setTitle('Registered Projects and Release Channel for this server');

    if (config.releasesChannel !== '-1')
        embed.addField('Announcements Channel', '<#' + config.releasesChannel + '>');
    else
        embed.addField('Announcements Channel', 'None');

    if (config.messageTemplate !== '')
        embed.addField('Template Message', config.messageTemplate);
    else
        embed.addField('Template Messsage', 'None');

    if (idNamePairs.length > 0)
        embed.addFields(idNamePairs);
    else
        embed.setTitle('No Projects have been Scheduled on this server');

    return { main: embed, extras: extraEmbed };
}