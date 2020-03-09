package io.github.davoleo.curseupdates;/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 09/03/2020 / 22:09
 * Class: io.github.davoleo.curseupdates.EmbedHelper
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

import discord4j.core.spec.EmbedCreateSpec;

import java.awt.*;
import java.util.Random;
import java.util.function.Consumer;

public class EmbedHelper {

    public static Random random = new Random();

    //Dark Gray - Gold - Orange
    public static Color[] colors = {new Color(0x404040), new Color(0xFEBC11), new Color(0xF26122)};

    public static Consumer<EmbedCreateSpec> template = spec -> {
        spec.setTitle("TEST TITLE");
        spec.setDescription("test description\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse egestas placerat erat, in lacinia odio. Aenean interdum ac elit quis malesuada. In posuere a nisi a volutpat. Phasellus venenatis sapien eu metus scelerisque, et volutpat nunc fringilla.");
        spec.setColor(colors[random.nextInt(3)]);
    };

}
