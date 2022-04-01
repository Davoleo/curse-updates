import Command from "../../model/Command";
import { CommandGroup } from "../../model/CommandGroup";
import { CommandPermission } from "../../utils";

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

export const comm = new Command(
    'updatestuff', 
    "does nothing - Internal Command only runnable by the bot author",
    CommandGroup.GENERAL,
    CommandPermission.OWNER
)
.setAction(updatestuff);