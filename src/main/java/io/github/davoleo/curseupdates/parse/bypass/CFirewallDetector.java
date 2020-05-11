package io.github.davoleo.curseupdates.parse.bypass;

import org.jsoup.nodes.Document;

public class CFirewallDetector {

  private static final String CLASS_TO_HAVE = "cf-browser-verification";
  private static final String CHALLENGE_FORM_ID = "challenge-form";

  public boolean isBehindFirewall(Document response) {
    if (response.getElementsByClass(CLASS_TO_HAVE).isEmpty()) {
      return false;
    } else if (response.getElementById(CHALLENGE_FORM_ID) == null) {
      return false;
    }
    return true;
  }

}
