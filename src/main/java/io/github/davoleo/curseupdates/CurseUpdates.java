package io.github.davoleo.curseupdates;

import discord4j.core.DiscordClient;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.event.domain.message.MessageCreateEvent;
import io.github.davoleo.curseupdates.command.Command;
import io.github.davoleo.curseupdates.command.Commands;
import io.github.davoleo.curseupdates.utils.Utils;

import java.io.File;
import java.util.Map;
import java.util.Scanner;

public class CurseUpdates {

    public static File prefixFile;

    public static void main(String[] args) {

        DiscordClientBuilder builder = new DiscordClientBuilder(args[0]);

        DiscordClient client = builder.build();

        //Load the saved/default prefix from a file
        loadPrefix();

        //Get the client event dispatcher to handle the event of MessageCreation
        client.getEventDispatcher().on(MessageCreateEvent.class)
                .subscribe(event -> {
                    final String message = event.getMessage().getContent().orElse("");      //Get the message content or else get ""
                    for (final Map.Entry<String, Command> entry : Commands.commands.entrySet()) {
                        if (message.startsWith(Commands.prefix + entry.getKey())) {   //if the message begins with the prefix char and ends with one of the command strings
                            entry.getValue().execute(event);    //Execute the command and break out of the for loop
                            break;
                        }
                    }
                });

        //login with the bot account and block it in to listen for commands
        client.login().block();
    }

    /**
     * Loads a previously saved prefix
     * if a previously saved prefix doesn't exist then set the default prefix as '|'
     */
    private static void loadPrefix() {

        prefixFile = new File(Utils.getResourcesDirPath().concat("prefix.txt"));

        //If the prefix file is not null then read the saved prefix and set it as default prefix
        if (prefixFile.exists()) {
            Scanner scanner = new Scanner(CurseUpdates.class.getResourceAsStream("/prefix.txt"));
            Commands.prefix = scanner.next().charAt(0);
        } else {
            //Otherwise set the default prefix as '|'
            Commands.prefix = '|';
        }
    }
}
