/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 09/03/2020 / 21:39
 * Class: io.github.davoleo.curseupdates.command.Command
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

package io.github.davoleo.curseupdates.command;

import discord4j.core.event.domain.message.MessageCreateEvent;

public interface Command {

    void execute(MessageCreateEvent event);

}
