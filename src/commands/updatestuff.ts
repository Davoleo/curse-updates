import { CommandInteraction } from "discord.js";
import Command from "../model/Command.js";
import { CommandScope } from "../model/CommandGroup.js";
import { CommandPermission } from "../util/discord.js";

function updatestuff(interaction: CommandInteraction) {

    // const commandData = [];
    // commands.forEach(command => {
    //     const obj = {
    //         name: command.name,
    //         description: command.description,
    //     };
    //     commandData.push(obj);
    // });

    //slashCommands = await botClient.guilds.cache.get('500396398324350989')
    
    interaction.reply('dogsong intensifies');
}

export const command = new Command(
    'updatestuff', 
    "does nothing - Internal Command only runnable by the bot author",
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
)
.setAction(updatestuff);