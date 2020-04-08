/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 08/04/2020 / 17:58
 * Class: PHPBridge
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

package io.github.davoleo.curseupdates.parse;

import php.java.bridge.http.JavaBridgeRunner;

import java.net.MalformedURLException;
import java.net.URL;

public class PHPBridge {

    public static final String PHP_PORT = "3333";

    private static final JavaBridgeRunner runner = JavaBridgeRunner.getInstance(PHP_PORT);

    // TODO: 08/04/2020 Runtime.getRuntime().exec() (?)
    public static void request(String slug) {

        URL url = null;

        try {
            url = new URL("https://www.curseforge.com/minecraft/mc-mods/" + slug + "/files");
            runner.waitFor();
        } catch (MalformedURLException e) {
            System.out.println("The URL is malformed");
            e.printStackTrace();
        } catch (InterruptedException e) {
            //When the runner is interrupted
            e.printStackTrace();
        }
    }

    public void hello(String[] args) {
        System.out.println("Hello " + args[0]);
    }

}
