import { CommandInteraction, Message } from "discord.js";
import Command from "../model/Command";
import { CommandGroup } from "../model/CommandGroup";
import { CommandPermission } from "../utils";

function ping(interaction: CommandInteraction) {
    interaction.reply({content: "Pinging...", fetchReply: true}).then((reply: Message) => {
        const randPingPong = Math.random() < 0.5 ? 'PONG!' : 'PING!';
        const delta = reply.createdTimestamp - interaction.createdTimestamp
        interaction.editReply(randPingPong + ":ping_pong: - Response Time: " + delta + 'ms')
    });
}

export const command = new Command(
    'ping', 
    'Sends a message with information about the latency of the bot response',
    CommandGroup.GENERAL,
    CommandPermission.USER
)
.setAction(ping);