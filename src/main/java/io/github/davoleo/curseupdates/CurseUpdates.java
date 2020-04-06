package io.github.davoleo.curseupdates;

import discord4j.core.DiscordClient;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.event.domain.message.MessageCreateEvent;
import io.github.davoleo.curseupdates.command.Command;
import io.github.davoleo.curseupdates.command.Commands;
import io.github.davoleo.curseupdates.utils.Utils;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.Scanner;

public class CurseUpdates {

    public static File prefixFile;

    public static void main(String[] args) {

        DiscordClientBuilder builder = new DiscordClientBuilder(args[0]);

        DiscordClient client = builder.build();

        loadPrefix();

        client.getEventDispatcher().on(MessageCreateEvent.class)
                .subscribe(event -> {
                    final String message = event.getMessage().getContent().orElse("");
                    for (final Map.Entry<String, Command> entry : Commands.commands.entrySet()) {
                        if (message.startsWith(Commands.prefix + entry.getKey())) {
                            entry.getValue().execute(event);
                            break;
                        }
                    }
                });

        client.login().block();
    }

    private static void loadPrefix() {
        try {
            String prefixPath = CurseUpdates.class.getResource("/dummyfile.txt").toURI().toASCIIString().replace("dummyfile", "prefix");
            prefixFile = new File(prefixPath);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }

        if (!prefixFile.exists()) {
            try {
                prefixFile.createNewFile();
                Utils.savePrefix('|');
                Commands.prefix = '|';
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            Scanner scanner = new Scanner(CurseUpdates.class.getResourceAsStream("/prefix.txt"));
            Commands.prefix = scanner.next().charAt(0);
        }
    }
}
