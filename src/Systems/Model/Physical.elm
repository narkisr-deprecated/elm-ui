module Systems.Model.Physical where

import Maybe 

type alias Physical = 
  { 
    mac : Maybe String,
    broadcast : Maybe String
  }

emptyPhysical: Physical
emptyPhysical = 
   Physical Nothing Nothing

