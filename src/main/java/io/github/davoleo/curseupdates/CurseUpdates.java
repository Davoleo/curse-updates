package io.github.davoleo.curseupdates;/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 06/01/2020 / 12:08
 * Class: io.github.davoleo.curseupdates.CurseUpdates
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

import io.github.davoleo.curseupdates.command.Command;
import io.github.davoleo.curseupdates.command.Commands;
import discord4j.core.DiscordClient;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.event.domain.message.MessageCreateEvent;

import java.util.Map;

public class CurseUpdates {

    public static void main(String[] args) {

        DiscordClientBuilder builder = new DiscordClientBuilder(args[0]);

        DiscordClient client = builder.build();

        client.getEventDispatcher().on(MessageCreateEvent.class)
                .subscribe(event -> {
                    final String message = event.getMessage().getContent().orElse("");
                    for (final Map.Entry<String, Command> entry : Commands.commands.entrySet()) {
                        if (message.startsWith(Commands.PREFIX + entry.getKey())) {
                            entry.getValue().execute(event);
                            break;
                        }
                    }
                });

        client.login().block();
    }

}
