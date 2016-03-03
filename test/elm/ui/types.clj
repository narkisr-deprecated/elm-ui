(ns elm.ui.types
  (:use 
     elm.ui.common  
     midje.sweet 
     clj-webdriver.taxi
     clj-webdriver.driver)
  (:require 
    [taoensso.timbre :as timbre]))

(defn type-base [type' env]
  (wait-until #(exists? "div#Environment"))
  (input-text (find-element-under {:tag "div" :id "Type"} {:tag :input}) type')
  (input-text (find-element-under {:tag "div" :id "Description"} {:tag :input}) "a nice type")
  (select-by-text (find-element-under "div#Environment" {:tag :select}) env))

(defn module [name source args]
  (wait-until #(exists? "div#Name"))
  (input-text (find-element-under {:tag "div" :id "Name"} {:tag :input}) name)
  (input-text (find-element-under {:tag "div" :id "Source"} {:tag :input}) source)
  (input-text (find-element-under {:tag "div" :id "Arguments"} {:tag :input}) args)
  )

(defn add-a-type []
  (wait-until #(visible? "a.TypesMenu") 5000 1000)
  (click "a.TypesMenu") 
  (wait-until #(visible? "a.TypesAdd") 5000 1000)
  (click "a.TypesAdd") 
  (type-base "foo" "qa")
  (click-next)
  (module "foo" "http://google.com" "one two")
  (click-next)
  )

(defn type-save []
  (set-driver!  {:browser :firefox})
  (login)    
  (add-a-type) 
  )

(type-save)
