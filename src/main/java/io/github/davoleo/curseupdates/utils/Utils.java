/* -----------------------------------
 * Author: Davoleo
 * Date / Hour: 06/04/2020 / 18:33
 * Class: Utils
 * Project: curse-updates
 * Copyright - © - Davoleo - 2020
 * ----------------------------------- */

package io.github.davoleo.curseupdates.utils;

import io.github.davoleo.curseupdates.CurseUpdates;

import java.io.FileWriter;
import java.io.IOException;

public class Utils {

    public static void savePrefix(char prefix) {
        if (CurseUpdates.prefixFile.exists()) {
            try {
                FileWriter writer = new FileWriter(CurseUpdates.prefixFile, false);
                writer.write(prefix);
                writer.close();
            } catch (IOException e) {
                System.out.println("COULDN'T FIND THE PREFIX FILE :(\n\n");
                e.printStackTrace();
            }
        }
    }

}
