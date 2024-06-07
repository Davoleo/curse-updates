import {CommandInteraction} from "discord.js";
import Command from "../model/Command.js";
import {CommandScope} from "../model/CommandGroup.js";
import {CommandPermission} from "../util/discord.js";
import {initCommands, loadCommandFiles} from "../commandLoader.js";
import {commandsMap} from "../main.js";

function reload(interaction: CommandInteraction) {
    loadCommandFiles()
        .then(commands => {
            initCommands(commands);

            commandsMap.clear();
            //Add loaded commands to a global Map
            for (const command of commands) {
                commandsMap.set(command.name, command);
            }
        })
        .catch(err => {
            void interaction.reply("Failed to reload command files! read logs for more info...");
            console.error(err);
        });

    void interaction.reply("Slash command reload issued successfully! read logs for more info...");
}

export const command = new Command(
    'reload',
    "reloads Slash Commands on this bot instance - Internal Command",
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
)
.setAction(reload);