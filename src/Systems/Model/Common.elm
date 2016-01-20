module Systems.Model.Common where

import Systems.Model.AWS exposing (AWS)
import Systems.Model.GCE exposing (GCE)
import Systems.Model.Digital exposing (Digital)
import Systems.Model.Openstack exposing (Openstack)
import Dict exposing (Dict)

type alias Machine = 
  { user : String
  , hostname : String
  , domain : String 
  , ip : Maybe String
  , os : String
  }

type alias System = 
  { owner : String 
  , env : String
  , type' : String 
  , machine: Machine
  , aws : Maybe AWS
  , gce : Maybe GCE
  , digital : Maybe Digital
  , openstack : Maybe Openstack
  -- template
  , name : Maybe String
  , defaults : Maybe (Dict String)
  }

emptyMachine : Machine
emptyMachine =
  Machine "" "" "" (Just "") ""

emptySystem : System
emptySystem =
  System "" "" "" (Machine  "" "" "" (Just "") "") Nothing Nothing Nothing Nothing Nothing Nothing
