(ns run
 (:require 
    [clojure.core.async :refer (go go-loop dropping-buffer <! >! timeout chan)]
    [taoensso.timbre :as timbre]
    [juxt.dirwatch :refer (watch-dir)])
 (:use midje.repl)
 )

(def run-tests (atom false))


(def c (chan (dropping-buffer 1)))

(defn run-facts [e] (go (>! c e)))

(watch-dir run-facts (clojure.java.io/file "./src/"))

(watch-dir run-facts (clojure.java.io/file "./test/elm/"))

(go-loop []
   (let [x (<! c)]
     (try 
       (timbre/info "facts loaded" x) 
       (load-facts 'elm.ui.add) 
       (<! (timeout 4000))
     (catch Exception e (timbre/error e))))
   (recur))
