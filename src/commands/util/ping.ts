import { Message } from "discord.js";
import Command from "../../model/Command";
import { Permission } from "../../utils";

function run(_: string[], messageRef: Message) {
    console.log(messageRef)
    messageRef.channel.send("Pinging...").then((pingMessage) => {
        pingMessage.edit('PONG! :ping_pong: - Response Time: ' + (pingMessage.createdTimestamp - messageRef.createdTimestamp) + 'ms')
    });
    return "";
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