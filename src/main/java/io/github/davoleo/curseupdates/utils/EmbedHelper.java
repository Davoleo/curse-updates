package io.github.davoleo.curseupdates.utils;

import discord4j.core.spec.EmbedCreateSpec;
import io.github.davoleo.curseupdates.command.Commands;

import java.awt.*;
import java.util.Random;
import java.util.function.Consumer;

public class EmbedHelper {

    public static Random random = new Random();

    //Dark Gray - Gold - Orange
    public static Color[] colors = {new Color(0x404040), new Color(0xFEBC11), new Color(0xF26122)};

    public static Consumer<EmbedCreateSpec> template = spec -> {
        spec.setTitle("TEST TITLE");
        //spec.setDescription("test description\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse egestas placerat erat, in lacinia odio. Aenean interdum ac elit quis malesuada. In posuere a nisi a volutpat. Phasellus venenatis sapien eu metus scelerisque, et volutpat nunc fringilla.");
        spec.setColor(colors[random.nextInt(3)]);
    };

    public static Consumer<EmbedCreateSpec> helpEmbed = spec -> {
        spec.setTitle("Commands");
        spec.addField(Commands.prefix + "ping", "sends a message with information about the latency of the bot response", false);
        spec.addField(Commands.prefix + "changeprefix `<prefix>`", "changes the command prefix of the bot to the char passed as argument - the prefix is reset as `|` after a bot restart", false);
        spec.addField(Commands.prefix + "help", "shows this embed with a list of all the available commands and their usage and descriptions", false);
    };

}
