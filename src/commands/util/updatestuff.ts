import Command from "../../model/Command";
import { Permission } from "../../utils";

function run() {
    for (const serverId in config.serverConfig) {
        config.serverConfig[serverId].messageTemplate = '';
        fileUtils.updateJSONConfig(config);
    }

    return 'OwO update complete!';
}

export const ping: Command = new Command(
    'updatestuff', 
    {
        description: 'performs updates on the internal JSON database - Internal Command only runnable by the bot author',
        isGuild: true,
        action: run,
        permLevel: Permission.DAVOLEO,
        argNames: [],
        async: false
    }
);