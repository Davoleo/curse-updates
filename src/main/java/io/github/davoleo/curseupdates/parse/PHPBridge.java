/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 08/04/2020 / 17:58
 * Class: PHPBridge
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

package io.github.davoleo.curseupdates.parse;

import io.github.davoleo.curseupdates.parse.bypass.CHttpRequester;
import org.jsoup.nodes.Document;

import javax.script.ScriptException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;

public class PHPBridge {

    // TODO: 08/04/2020 Runtime.getRuntime().exec() (?)
    public static String request(String slug) {

        CHttpRequester requester = new CHttpRequester();
        String url;

        try {
            url = "https://www.curseforge.com/minecraft/mc-mods/" + slug + "/files";
            Document document = requester.get(url);
            return document.outerHtml();
        } catch (MalformedURLException e) {
            System.out.println("The URL is malformed");
            e.printStackTrace();
        } catch (IOException | URISyntaxException | InterruptedException | ScriptException e) {
            e.printStackTrace();
        }
        return "fuori dal try";
    }
}
