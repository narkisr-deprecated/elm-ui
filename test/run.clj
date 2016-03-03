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
      (first (filter identity (map #(.contains (.getPath file) %) ["index.html" "main.js" ".clj"])))))))

(defn run-facts [e] 
  (go (>! c e)))

(watch-dir run-facts (clojure.java.io/file "."))

(go-loop []
   (let [ns- (System/getenv "NS") x (<! (async/merge [(timeout 1000) c] (dropping-buffer 1)))]
     (timbre/info x)
     (try 
      (timbre/info "Starting to run suite")
      (let [{:keys [out err exit]} (sh "lein" "midje" ns-)]
        (if-not (= exit 0)
           (timbre/error err)
           (timbre/info out)))
      (catch Exception e (timbre/error e))))
   (recur))
