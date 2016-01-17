(ns run
 (:require 
    [clojure.java.shell :refer  [sh]]
    [clojure.core.async :as async :refer (go go-loop dropping-buffer <! >! timeout chan)]
    [taoensso.timbre :as timbre]
    [juxt.dirwatch :refer (watch-dir)])
 (:use midje.repl)
 )

(def run-tests (atom false))


(def c (chan))

(defn run-facts [e] 
  (go (>! c e)))

(watch-dir run-facts (clojure.java.io/file "./src/"))

(watch-dir run-facts (clojure.java.io/file "./test/elm/"))

(go-loop []
   (let [x (<! (async/merge [(timeout 2000) c] (dropping-buffer 1)))]
     (try 
       (timbre/info "Starting to run suite")
       (timbre/info (:out (sh "lein" "midje" "elm.ui.add")))
     (catch Exception e (timbre/error e))))
   (recur))
