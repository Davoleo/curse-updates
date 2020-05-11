package io.github.davoleo.curseupdates.parse.bypass;

import java.util.HashMap;
import java.util.Map;
import javax.script.ScriptException;
import org.jsoup.nodes.Document;

public class CChallengeResolve {

  private String CHALLENGE_1_KEY = "jschl_vc";
  private String CHALLENGE_2_KEY = "pass";
  private String CHALLENGE_3_KEY = "jschl_answer";

  private CJavascriptChallengeHelper cRegexHelper;

  public CChallengeResolve(CJavascriptChallengeHelper cRegexHelper) {
    this.cRegexHelper = cRegexHelper;
  }

  public Map<String, String> getPathParams(Document response, String domain)
      throws ScriptException {
    Map<String, String> paramMap = new HashMap<>();
    paramMap.put(CHALLENGE_1_KEY,
        response.getElementsByAttributeValue("name", CHALLENGE_1_KEY).val());
    paramMap.put(CHALLENGE_2_KEY,
        response.getElementsByAttributeValue("name", CHALLENGE_2_KEY).val());
    paramMap.put(CHALLENGE_3_KEY, resolveJavascriptChallenge(response, domain));

    return paramMap;
  }

  private String resolveJavascriptChallenge(Document response, String domain)
      throws ScriptException {
    String js = response.getElementsByTag("script").html();
    return String.valueOf(cRegexHelper.solveChallenge(js) + domain.length());
  }
}
