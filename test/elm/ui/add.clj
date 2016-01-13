(ns elm.ui.add
  (:import 
     org.openqa.selenium.Dimension
    org.openqa.selenium.remote.DesiredCapabilities
    org.openqa.selenium.phantomjs.PhantomJSDriver
    org.openqa.selenium.OutputType)
  (:use 
     midje.sweet 
     clj-webdriver.taxi
     clj-webdriver.driver
 )
  (:require 
    [taoensso.timbre :as timbre]
    ) 
  )

(defn take-snapshot []
  (.getScreenshotAs (:webdriver clj-webdriver.taxi/*driver*) OutputType/FILE))

(defn login []
  (to "https://localhost:8443/")
  (wait-until #(exists? "input#username"))
  (input-text "#username" "admin")
  (-> "#password" (input-text "changeme") submit)
  (wait-until #(exists? "a.SystemsMenu")))

(defn add-a-system []
  (wait-until #(visible? "a.SystemsMenu") 5000 1000)
  (click "a.SystemsMenu") 
  (wait-until #(visible? "a.SystemsAdd") 5000 1000)
  (click "a.SystemsAdd") 
  (wait-until #(exists? "div#Hypervisor")))

(defn select-hypervisor [hypervisor type]
  (select-by-text (find-element-under "div#Type" {:tag :select}) type)
  (select-by-text (find-element-under "div#Hypervisor" {:tag :select}) hypervisor))

(defn save []
  (wait-until #(exists? {:tag "span" :class "caret"}))
  (click ".caret") 
  (click ".SaveOnly"))

(defn network []
  (wait-until #(exists? {:tag "div" :id "Hostname"}))
  (input-text (find-element-under {:tag "div" :id "Hostname"} {:tag :input}) "red1")
  (input-text (find-element-under {:tag "div" :id "Domain"} {:tag :input}) "local"))

(defn click-next [] (click "button#Next"))

(defn click-hidden [q]
  (execute-script
    (str "document.querySelector('" q "').click();")))

(defn search [query]
  (wait-until #(exists? {:tag "input" :id "systemSearch"}))
  (input-text "input#systemSearch" query))

(System/setProperty "webdriver.chrome.driver" "/usr/bin/chromedriver")

(defn set-view-size [driver]
  (.setSize (.window (.manage driver)) (Dimension. 1920 1080)) driver)
 
(defn phantom-driver []
  (let [args (into-array String ["--ignore-ssl-errors=true" "--webdriver-loglevel=ERROR"])]
  (PhantomJSDriver. 
    (doto (DesiredCapabilities.)
       (.setCapability "phantomjs.page.settings.userAgent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
       (.setCapability "phantomjs.page.customHeaders.Accept-Language" "en-US")
       (.setCapability "phantomjs.page.customHeaders.Connection" "keep-alive")
       (.setCapability "phantomjs.cli.args" args)))))

(defn create-phantom []
  (init-driver {:webdriver (set-view-size (phantom-driver))}))

(def browser {:browser :phantomjs})

(defmacro with-driver-
  [driver & body]
  `(binding [clj-webdriver.taxi/*driver* ~driver]
     (try ~@body
       (catch Exception e# 
         (timbre/error e#)
         (take-snapshot))
       (finally (quit)))))

(fact "Adding gce system" :gce 
  (with-driver- (create-phantom)
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
     (search "hostname=red1")
     #_(text (find-table-cell "table#systemsListing" [1 1]) => "red1")))

(fact "Adding openstack system" :openstack
  (with-driver- (create-phantom)
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
    (search "hostname=red1")
    (text (find-table-cell "table#systemsListing" [1 1])) => "red1"))
