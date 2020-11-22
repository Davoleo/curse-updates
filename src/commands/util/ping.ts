import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
    return 'PONG! :ping_pong: - Response Time: ' + messageRef.client.ws.ping + 'ms'
}

export const ping: Command = new Command(
    'ping', 
    'Sends a message with information about the latency of the bot response',
    false,
    run,
    Permission.USER
);