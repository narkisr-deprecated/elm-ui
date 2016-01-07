module Systems.Model.Openstack where
import Dict
import Maybe exposing (withDefault)

type alias Volume = 
  { device : String
  , size : Int
  , clear : Bool
  } 

type alias Openstack = 
  { flavor : String
  , tenant : String
  , keyName : String
  , securityGroups : Maybe (List String)
  , networks : (List String)
  , volumes : Maybe (List Volume)
  }


emptyVolume : Volume
emptyVolume =
  Volume "" 0 False

emptyOpenstack : Openstack 
emptyOpenstack = 
  let
    justString = Just ""
  in
    Openstack "" "" "" (Just []) [] (Just [])

