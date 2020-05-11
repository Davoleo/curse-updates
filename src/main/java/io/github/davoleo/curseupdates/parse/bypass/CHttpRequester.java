package io.github.davoleo.curseupdates.parse.bypass;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Map;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class CHttpRequester {

  private static final String URL_TEMPLATE = "%s://%s/cdn-cgi/l/chk_jschl";
  private CFirewallDetector cFirewallDetector;
  private CChallengeResolve cChallengeResolve;
  private static final String USER_AGENT = "Mozilla/5.0 (Windows; U; Windows NT 6.1; rv:2.2) Gecko/20110201";
  private static final int TIMEOUT = 10000;

  public CHttpRequester() {
    this.cFirewallDetector = new CFirewallDetector();
    this.cChallengeResolve = new CChallengeResolve(
        new CJavascriptChallengeHelper(new ScriptEngineManager().getEngineByName("nashorn")
        ));
  }

  public Document get(String uri)
      throws URISyntaxException, IOException, InterruptedException, ScriptException {
    Document response = Jsoup.connect(uri)
        .timeout(TIMEOUT)
        .userAgent(USER_AGENT)
        .ignoreHttpErrors(true)
        .get();

    if (cFirewallDetector.isBehindFirewall(response)) {
      URL url = new URL(uri);
      Map<String, String> params = cChallengeResolve.getPathParams(response, url.getHost());
      String urlToConnect = String.format(URL_TEMPLATE, url.getProtocol(), url.getHost());
      Thread.sleep(5000);
      return Jsoup.connect(urlToConnect).data(params).timeout(TIMEOUT).userAgent(USER_AGENT)
          .get();
    } else {
      return response;
    }
  }

}
