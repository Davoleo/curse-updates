import {CommandInteraction} from "discord.js";
import Command from "../model/Command.js";
import {CommandScope} from "../model/CommandGroup.js";
import {CommandPermission} from "../util/discord.js";

function updatestuff(interaction: CommandInteraction) {
    void interaction.reply('dogsong intensifies');
}

export const command = new Command(
    'updatestuff', 
    "does nothing - Internal Command only runnable by the bot author",
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
)
.setAction(updatestuff);