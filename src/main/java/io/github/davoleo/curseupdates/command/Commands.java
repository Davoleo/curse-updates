/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 09/03/2020 / 21:40
 * Class: Commands
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

package io.github.davoleo.curseupdates.command;

import io.github.davoleo.curseupdates.parse.PHPBridge;
import io.github.davoleo.curseupdates.utils.EmbedHelper;
import io.github.davoleo.curseupdates.utils.Utils;

import java.util.HashMap;
import java.util.Map;

public class Commands {

    public static final Map<String, Command> commands = new HashMap<>();
    public static char prefix;

    static {
        //noinspection ConstantConditions
        commands.put("ping", event -> event.getMessage().getChannel().block()
                .createMessage("PONG! - Response Time: " + event.getClient().getResponseTime() + "ms").block());

        commands.put("changeprefix", event -> {
            String message = event.getMessage().getContent().orElse("");
            if (!message.equals("")) {
                message = message.replace(prefix + "changeprefix ", "");
                if (message.length() != 1) {
                    event.getMessage().getChannel().block().createMessage("You can only assign a string of one character as prefix!").block();
                } else {
                    prefix = message.charAt(0);
                    Utils.savePrefix(prefix);
                    event.getMessage().getChannel().block().createMessage("`" + prefix + "` is now the current prefix for commands").block();
                }
                System.out.println(message);
            }
        });

        commands.put("test", event -> {
            PHPBridge.request("metallurgy-4-reforged");
            event.getMessage().getChannel().block().createMessage("Request was successful");
        });

        commands.put("help", event -> event.getMessage().getChannel().block()
                .createMessage(messageCreateSpec -> messageCreateSpec.setEmbed(EmbedHelper.template.andThen(EmbedHelper.helpEmbed))).block());
    }

}
