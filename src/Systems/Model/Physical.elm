module Systems.Model.Physical where

type alias Physical = 
  { 
    mac : String,
    broadcast : String
  }

emptyPhysical: Physical
emptyPhysical = 
   Physical "" ""

