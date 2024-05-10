import {CommandInteraction} from "discord.js";
import Command from "../model/Command.js";
import {CommandScope} from "../model/CommandGroup.js";
import {CommandPermission} from "../util/discord.js";
import CacheManager from "../services/CacheService.js";

function updatestuff(interaction: CommandInteraction) {

    CacheManager.getAllProjects().then(projects => {

        if (projects.length === 0) {
            interaction.reply('dogsong intensifies');
            return [];
        }

        const transactionId = "$CLEANUP_COMMAND$"

        const promises = [];
        for (const project of projects) {
            promises.push(CacheManager.cleanupProject(project.id, transactionId));
        }
        return Promise.all(promises);
    }).then(
        cleanUpFlags => cleanUpFlags.map(flag => flag ? 1 : 0)
            .reduce((a, b) => a + b, 0))
        .then(value => interaction.reply(`Cache cleanup found ${value} useless projects!`));
}

export const command = new Command(
    'updatestuff', 
    "does nothing - Internal Command only runnable by the bot author",
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
)
.setAction(updatestuff);