package io.github.davoleo.curseupdates.parse.bypass;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

public class CJavascriptChallengeHelper {

  private String regex1 = "setTimeout\\(function\\(\\)\\{\\s+(var s,t,o,p,b,r,e,a,k,i,n,g,f.+\\r?\\n[\\s\\S]*a\\.value = .+)\\r?\\n";
  private String regex2 = "a\\.value = (parseInt\\(.+?\\)).+";
  private String regex3 = "\\s{3,}[a-z](?: = |\\.).+";

  private final Pattern regex1pattern = Pattern.compile(regex1);
  private final Pattern regex2pattern = Pattern.compile(regex2);
  private final Pattern regex3pattern = Pattern.compile(regex3);

  private final ScriptEngine scriptEngine;

  public CJavascriptChallengeHelper(ScriptEngine scriptEngine) {
    this.scriptEngine = scriptEngine;
  }

  public int solveChallenge(String js) throws ScriptException {
    Matcher patternMatcher = regex1pattern.matcher(js);

    String jsOffuscatedFunction;
    String parseIntFunction;
    String parseIntFunctionToReplace;
    String clearedJs;

    if (patternMatcher.find()) {
      jsOffuscatedFunction = patternMatcher.group(1);
    } else {
      throw new UnknownChallengeException();
    }

    patternMatcher = regex2pattern.matcher(jsOffuscatedFunction);
    if (patternMatcher.find()) {
      parseIntFunction = patternMatcher.group(0);
      parseIntFunctionToReplace = patternMatcher.group(1);
    } else {
      throw new UnknownChallengeException();
    }

    jsOffuscatedFunction = jsOffuscatedFunction
        .replace(parseIntFunction, parseIntFunctionToReplace);

    patternMatcher = regex3pattern.matcher(jsOffuscatedFunction);
    if (patternMatcher.find()) {
      clearedJs = patternMatcher.replaceAll("");
      clearedJs = clearedJs.replaceAll("\\n", "");
    } else {
      throw new UnknownChallengeException();
    }

    if (!canBeSolved(clearedJs)) {
      throw new UnknownChallengeException();
    }

    return runInJsEngine(clearedJs);
  }

  private boolean canBeSolved(String str) {
    return str.contains("parseInt");
  }

  private int runInJsEngine(String jsToExecute) throws ScriptException {
    return ((Double) scriptEngine.eval(jsToExecute)).intValue();
  }
}
