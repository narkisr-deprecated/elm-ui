(ns elm.ui.systems
  (:use 
     elm.ui.common  
     midje.sweet 
     clj-webdriver.taxi
     clj-webdriver.driver)
  (:require 
    [taoensso.timbre :as timbre]))

(defn add-a-system []
  (wait-until #(visible? "a.SystemsMenu") 5000 1000)
  (click "a.SystemsMenu") 
  (wait-until #(visible? "a.SystemsAdd") 5000 1000)
  (click "a.SystemsAdd") 
  (wait-until #(exists? "div#Hypervisor")))

(defn select-hypervisor [hypervisor type]
  (select-by-text (find-element-under "div#Type" {:tag :select}) type)
  (select-by-text (find-element-under "div#Hypervisor" {:tag :select}) hypervisor))

(defn save 
  ([] (save "System")) 
  ([target] 
     (wait-until #(exists? {:tag "span" :class "caret"}))
     (click ".caret") 
     (click (str ".Save" target))
     ; let ES do its thing 
     (Thread/sleep 1000)))

(defn network
  ([] (network "red1"))
  ([hostname] 
    (wait-until #(exists? {:tag "div" :id "Hostname"}))
    (input-text (find-element-under {:tag "div" :id "Hostname"} {:tag :input}) hostname)
    (input-text (find-element-under {:tag "div" :id "Domain"} {:tag :input}) "local")))


(defn search [query]
  (wait-until #(exists? {:tag "input" :id "systemSearch"}))
  (input-text "input#systemSearch" query)
  (Thread/sleep 3000)
  (wait-until #(visible? (find-element-under "tbody" {:tag :tr})) 1000))

(defn add [hyp type]
  (add-a-system) 
  (select-hypervisor hyp type) 
  (click-next))

(defn openstack-instance []
   (wait-until #(exists? {:tag "div" :id "User"}))
   (input-text (find-element-under "div#Tenant" {:tag :input}) "admin")
   (input-text (find-element-under "div#User" {:tag :input}) "ubuntu")
   (input-text (find-element-under "div#Keypair" {:tag :input}) "lepus")
   (input-text (find-element-under {:tag "div" :id "Security groups"} {:tag :input}) "default")
   (click-next))

(defn openstack-partial-save []
   (set-driver!  {:browser :firefox})
   (login)    
   (add "openstack" "redis")
   (openstack-instance)
   (let [hostname (uuid)] 
      (network hostname)
      (input-text (find-element-under "div#IP-Pool" {:tag :input}) "net04_ext")
      (input-text (find-element-under "div#Networks" {:tag :input}) "net04")
      (click-next)
      ; skipping volumes
      (click-next)))

(defn openstack-partial-template []
   (set-driver!  {:browser :firefox})
   (login)    
   (add "openstack" "redis")
   (openstack-instance)
   (let [hostname (uuid)] 
      (network hostname)
      (input-text (find-element-under "div#IP-Pool" {:tag :input}) "net04_ext")
      (input-text (find-element-under "div#Networks" {:tag :input}) "net04")
      (click-next)
      ; skipping volumes
      (click-next) 
      (save "Template")))

(defn openstack-flow []
   (add "openstack" "redis")
   (openstack-instance)
   (let [hostname (uuid)] 
      (network hostname)
      (input-text (find-element-under "div#Networks" {:tag :input}) "net04")
      (click-next)
      ; skipping volumes
      (click-next) 
      (save)
      (search (str "hostname=" hostname))
      hostname
   ))


(defn gce-flow []
  (add "gce" "redis")
  (wait-until #(exists? {:tag "div" :id "Project id"}))
  (input-text (find-element-under {:tag "div" :id "Project id"} {:tag :input}) "ronen-playground")
  (input-text (find-element-under "div#User" {:tag :input}) "ronen")
  (input-text (find-element-under "div#Tags" {:tag :input}) "ssh-enabled")
  (click-next)
  (let [hostname (uuid)] 
    (network hostname)
    (click-next)
    (save) (search (str "hostname=" hostname))
     hostname
   ))

(defn digital-partial-save []
   (set-driver!  {:browser :firefox})
   (login)    
   (add "digital-ocean" "redis")
   (let [hostname (uuid)] 
      (input-text (find-element-under "div#User" {:tag :input}) "Foo")
      (input-text (find-element-under "div#Hostname" {:tag :input}) "Bar")
      (input-text (find-element-under "div#Domain" {:tag :input}) "local")
      (click-next)))

#_(with-driver- (create-phantom)
  (login)    
  (fact "Adding gce system" :gce 
    (let [hostname (gce-flow)] 
       (text (find-element-under "tbody" {:tag :tr})) => (contains hostname)))

  (fact "Adding openstack system" :openstack
    (let [hostname (openstack-flow)] 
       (text (find-element-under "tbody" {:tag :tr})) => (contains hostname))))

;; (digital-partial-save)
(openstack-partial-template)
;; (openstack-partial-save)
