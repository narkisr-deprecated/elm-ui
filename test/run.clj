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

(defn modetime []
  (.lastModified (java.io.File. "main.js")))

(def mainjs (atom (modetime)))

(go-loop []
   (let [x (<! (async/merge [(timeout 1000) c] (dropping-buffer 1)))]
     (try 
       (when (< @mainjs (modetime))
         (reset! mainjs (modetime))
         (timbre/info "Starting to run suite")
         (let [{:keys [out err exit]} (sh "lein" "midje" "elm.ui.add")]
           (if-not (= exit 0)
              (timbre/error err)
              (timbre/info out))))
      (catch Exception e (timbre/error e))))
   (recur))
