(ns elm.ui.add
  (:use midje.sweet 
        clj-webdriver.taxi))


(System/setProperty "webdriver.chrome.driver" "/usr/bin/chromedriver")

(fact "Adding gce system" :openstack :chrome
  (with-driver {:browser :chrome}
    (to "https://localhost:8443/")
     (input-text "#username" "admin")
     (-> "#password" (input-text "changeme") submit)
     (wait-until #(exists? "a.SystemsMenu"))
     (click "a.SystemsMenu") 
     (wait-until #(visible? "a.SystemsAdd"))
     (click "a.SystemsAdd") 
     (wait-until #(exists? "div#Hypervisor"))
     (select-by-text (find-element-under "div#Type" {:tag :select}) "redis")
     (select-by-text (find-element-under "div#Hypervisor" {:tag :select}) "gce")
     (click "button#Next") 
     (wait-until #(exists? {:tag "div" :id "Project id"}))
     (input-text (find-element-under {:tag "div" :id "Project id"} {:tag :input}) "ronen-playground")
     (input-text (find-element-under "div#User" {:tag :input}) "ronen")
     (input-text (find-element-under "div#Tags" {:tag :input}) "ssh-enabled")
     (click "button#Next") 
     (wait-until #(exists? {:tag "div" :id "Hostname"}))
     (input-text (find-element-under {:tag "div" :id "Hostname"} {:tag :input}) "red1")
     (input-text (find-element-under {:tag "div" :id "Domain"} {:tag :input}) "local")
     (click "button#Next") 
     (wait-until #(exists? {:tag "span" :class "caret"}))
     (click ".caret") 
     (click ".SaveOnly") 

     (Thread/sleep 5000)
    ))

