import { commands } from "../../main";
import Command from "../../model/Command";
import { Permission } from "../../utils";

async function run() {

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

export const comm: Command = new Command(
    'updatestuff', 
    {
        description: "does nothing - Internal Command only runnable by the bot author",
        isGuild: true,
        action: run,
        permLevel: Permission.OWNER,
        argNames: [],
        async: true
    }
);