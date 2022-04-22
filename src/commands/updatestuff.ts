import Command from "../model/Command";
import { CommandScope } from "../model/CommandGroup";
import { CommandPermission } from "../utils";

function updatestuff() {

    // const commandData = [];
    // commands.forEach(command => {
    //     const obj = {
    //         name: command.name,
    //         description: command.description,
    //     };
    //     commandData.push(obj);
    // });

    //slashCommands = await botClient.guilds.cache.get('500396398324350989')

    return 'dogsong intensifies';
}

export const command = new Command(
    'updatestuff', 
    "does nothing - Internal Command only runnable by the bot author",
    CommandScope.EVERYWHERE,
    CommandPermission.OWNER
)
.setAction(updatestuff);