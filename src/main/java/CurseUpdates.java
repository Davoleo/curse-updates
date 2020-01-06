/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 06/01/2020 / 12:08
 * Class: CurseUpdates
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

import com.fasterxml.jackson.databind.ObjectMapper;
import discord4j.core.DiscordClient;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.event.domain.lifecycle.ReadyEvent;
import discord4j.core.event.domain.message.MessageCreateEvent;
import discord4j.core.object.entity.Message;
import discord4j.core.object.entity.User;

import java.io.IOException;
import java.io.InputStream;

public class CurseUpdates {

    public static void main(String[] args) {

        String token = "";
        ObjectMapper mapper = new ObjectMapper();

        //System.out.println("PATHALCALCSCSS: " + CurseUpdates.class.getResource("").getPath());

        InputStream iStream = CurseUpdates.class.getResourceAsStream("/config.json");
        try {
            Token jsonObject = mapper.readValue(iStream, Token.class);
            token = jsonObject.getToken();
            System.out.println(jsonObject);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (token.equals(""))
            return;

        DiscordClientBuilder builder = new DiscordClientBuilder(token);

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
