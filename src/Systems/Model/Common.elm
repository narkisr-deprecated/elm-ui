module Systems.Model.Common where

import Systems.Model.AWS exposing (AWS)
import Systems.Model.GCE exposing (GCE)
import Systems.Model.Digital exposing (Digital)

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
  }

emptyMachine : Machine
emptyMachine =
  Machine "" "" "" (Just "") ""


