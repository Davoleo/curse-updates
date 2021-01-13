import { Message } from "discord.js";
import { botClient } from "../../main";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
    console.log(messageRef)
    return 'PONG! :ping_pong: - Response Time: ' + botClient.ws.ping + 'ms'
}

export const comm: Command = new Command(
    'ping', 
    {
        description: 'Sends a message with information about the latency of the bot response',
        isGuild: false,
        action: run,
        permLevel: Permission.USER,
        argNames: [],
        async: false
    }
);