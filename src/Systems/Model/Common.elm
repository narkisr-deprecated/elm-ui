module Systems.Model.Common where

import Systems.Model.AWS exposing (AWS)

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
  }

emptyMachine : Machine
emptyMachine =
  Machine "" "" "" (Just "") ""


