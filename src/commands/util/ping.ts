import { Message } from "discord.js";
import Command from "../../model/Command";
import { CommandGroup } from "../../model/CommandGroup";
import { CommandPermission } from "../../utils";

function run(_: string[], messageRef: Message) {
    messageRef.channel.send("Pinging...").then((pingMessage) => {
        if (Math.random() < 0.5)
            pingMessage.edit('PONG! :ping_pong: - Response Time: ' + (pingMessage.createdTimestamp - messageRef.createdTimestamp) + 'ms')
        else
            pingMessage.edit('PING! :ping_pong: - Response Time: ' + (pingMessage.createdTimestamp - messageRef.createdTimestamp) + 'ms')
    });
    return "";
}

export const comm: Command = new Command(
    'ping', 
    'Sends a message with information about the latency of the bot response',
    CommandGroup.GENERAL,
    CommandPermission.USER
);