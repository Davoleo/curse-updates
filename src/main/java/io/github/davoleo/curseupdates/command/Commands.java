/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 09/03/2020 / 21:40
 * Class: Commands
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

package io.github.davoleo.curseupdates.command;

import java.util.HashMap;
import java.util.Map;

import static io.github.davoleo.curseupdates.EmbedHelper.template;

public class Commands {

    public static final Map<String, Command> commands = new HashMap<>();
    public static final char PREFIX = '|';

    static {
        //noinspection ConstantConditions
        commands.put("ping", event -> event.getMessage().getChannel().block()
                .createMessage("PONG! - Response Time: " + event.getClient().getResponseTime() + "ms").block());

        commands.put("test", event -> event.getMessage().getChannel().block()
                .createMessage(messageCreateSpec -> messageCreateSpec.setEmbed(template)).block());
    }

}
