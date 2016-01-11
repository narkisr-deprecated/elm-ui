(ns elm.ui.add
  (:use midje.sweet 
        clj-webdriver.taxi))


(defn login []
  (to "https://localhost:8443/")
  (input-text "#username" "admin")
  (-> "#password" (input-text "changeme") submit)
  (wait-until #(exists? "a.SystemsMenu")))

(defn add-a-system []
  (click "a.SystemsMenu") 
  (wait-until #(visible? "a.SystemsAdd"))
  (click "a.SystemsAdd") 
  (wait-until #(exists? "div#Hypervisor")))

(defn select-hypervisor [hypervisor type]
  (select-by-text (find-element-under "div#Type" {:tag :select}) type)
  (select-by-text (find-element-under "div#Hypervisor" {:tag :select}) hypervisor)
  )

(defn save []
  (wait-until #(exists? {:tag "span" :class "caret"}))
  (click ".caret") 
  (click ".SaveOnly"))

(defn network []
  (wait-until #(exists? {:tag "div" :id "Hostname"}))
  (input-text (find-element-under {:tag "div" :id "Hostname"} {:tag :input}) "red1")
  (input-text (find-element-under {:tag "div" :id "Domain"} {:tag :input}) "local"))

(defn click-next []
  (click "button#Next") 
  )

(System/setProperty "webdriver.chrome.driver" "/usr/bin/chromedriver")

(fact "Adding gce system" :gce :chrome
  (with-driver {:browser :chrome}
     (login)    
     (add-a-system) 
     (select-hypervisor "gce" "redis") 
     (click-next)
     (wait-until #(exists? {:tag "div" :id "Project id"}))
     (input-text (find-element-under {:tag "div" :id "Project id"} {:tag :input}) "ronen-playground")
     (input-text (find-element-under "div#User" {:tag :input}) "ronen")
     (input-text (find-element-under "div#Tags" {:tag :input}) "ssh-enabled")
     (click-next)
     (network)
     (click-next)
     (save)
    ))

(fact "Adding openstack system" :openstack :chrome
  (with-driver {:browser :chrome}
     (login)
     (add-a-system)
     (select-hypervisor "openstack" "redis") 
     (click-next)
     (wait-until #(exists? {:tag "div" :id "User"}))
     (input-text (find-element-under "div#User" {:tag :input}) "ubuntu")
     (input-text (find-element-under "div#Keypair" {:tag :input}) "lepus")
     (input-text (find-element-under {:tag "div" :id "Security groups"} {:tag :input}) "default")
     (click-next)
     (network)
     (click-next) 
     (click-next) 
     (save) 
     (Thread/sleep 3000)
    ))
