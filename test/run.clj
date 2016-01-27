(ns run
 (:require 
    [clojure.java.shell :refer  [sh]]
    [clojure.core.async :as async :refer (go go-loop dropping-buffer <! >! timeout chan)]
    [taoensso.timbre :as timbre]
    [juxt.dirwatch :refer (watch-dir)])
 (:use midje.repl)
 )

(def run-tests (atom false))


(def c (chan (dropping-buffer 1) 
  (filter 
    (fn [{:keys [file]}] 
      (or (.contains (.getPath file) "index.html") (.contains (.getPath file) "main.js"))))))

(defn run-facts [e] 
  (go (>! c e)))

(watch-dir run-facts (clojure.java.io/file "."))

(go-loop []
   (let [x (<! (async/merge [(timeout 1000) c] ))]
     (timbre/info x)
     (try 
      (timbre/info "Starting to run suite")
      (let [{:keys [out err exit]} (sh "lein" "midje" "elm.ui.add")]
        (if-not (= exit 0)
           (timbre/error err)
           (timbre/info out)))
      (catch Exception e (timbre/error e))))
   (recur))
