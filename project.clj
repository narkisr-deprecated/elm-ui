(defproject elm-testing "0.1.0"
  :dependencies [
    [org.clojure/clojure "1.7.0"]
    [org.clojure/core.async "0.2.374"]
    [org.clojure/tools.trace "0.7.8"]
    [midje "1.6.3"]
    [clj-webdriver "0.7.2"]
    [org.seleniumhq.selenium/selenium-java "2.48.2"]
    [org.seleniumhq.selenium/selenium-remote-driver "2.48.2"]
    [org.seleniumhq.selenium/selenium-server "2.48.2"]
    [juxt/dirwatch "0.2.3"]
    [com.taoensso/timbre "4.2.0"] 
    [com.codeborne/phantomjsdriver "1.2.1"
       :exclusion  [org.seleniumhq.selenium/selenium-java 
                    org.seleniumhq.selenium/selenium-server
                    org.seleniumhq.selenium/selenium-remote-driver]]
   ]
  
  :plugins  [[lein-exec "0.3.5"] [lein-midje "3.1.3"]]
)
