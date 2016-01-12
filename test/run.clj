(ns run
 (:require 
    [taoensso.timbre :as timbre]
    [juxt.dirwatch :refer (watch-dir)])
 (:use midje.repl)
 )

(def run-tests (atom false))

(defn run-facts [c] 
  (when-not @run-tests 
      (future 
        (swap! run-tests (fn [_] true))  
        (try (load-facts)
          (catch Exception e (timbre/error e)))
        (swap! run-tests (fn [_] false)))))

(watch-dir run-facts (clojure.java.io/file "./src/"))

(watch-dir run-facts (clojure.java.io/file "./test/elm/"))
