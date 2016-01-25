module Templates.Defaults where

import Systems.Model.Common exposing (Defaults, emptyDefaults)
import Systems.Model.Openstack exposing (OpenstackDefaults)
import Json.Decode as Json exposing (..)

openstackDefaults = 
  object1 OpenstackDefaults
    (maybe ("networks" :=  list string))

defaultsDecoder : Decoder Defaults
defaultsDecoder = 
  object1 Defaults
   (maybe ("openstack" := openstackDefaults))

decodeDefaults : String -> Defaults
decodeDefaults json =
  case Json.decodeString defaultsDecoder json of 
    Ok value -> 
      value
    Err error -> 
      Debug.log error emptyDefaults
