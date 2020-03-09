/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 06/01/2020 / 12:08
 * Class: CurseUpdates
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

import discord4j.core.DiscordClient;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.event.domain.message.MessageCreateEvent;
import discord4j.core.object.entity.Message;

public class CurseUpdates {

    public static void main(String[] args) {

        DiscordClientBuilder builder = new DiscordClientBuilder(args[0]);

        DiscordClient client = builder.build();

        client.getEventDispatcher().on(MessageCreateEvent.class)
                .map(MessageCreateEvent::getMessage)
                .filter(message -> message.getAuthor().map(user -> !user.isBot()).orElse(false))
                .filter(message -> message.getContent().orElse("").equalsIgnoreCase("|ping"))
                .flatMap(Message::getChannel)
                .flatMap(messageChannel -> messageChannel.createMessage("PONG! - Response Time: " + client.getResponseTime() + "ms"))
                .subscribe();

        client.login().block();
    }

}
