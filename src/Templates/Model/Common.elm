module Templates.Model.Common where

import Json.Decode as Json exposing (..)
import Systems.Model.AWS exposing (AWS)
import Systems.Model.GCE exposing (GCE)
import Systems.Model.Digital exposing (Digital)
import Systems.Model.Openstack exposing (Openstack)
import Systems.Model.Physical exposing (Physical)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Decoders exposing (..)
import Dict exposing (Dict)
import Maybe exposing (withDefault)
import Common.Http exposing (apply)

type alias OpenstackDefaults = 
  {
   networks : Maybe (List String)
  }

emptyOpenstackDefaults = 
    OpenstackDefaults (Just [])

type alias Template = 
  { 
    name : String
  , type' : String 
  , description : String
  , machine: Machine
  , aws : Maybe AWS
  , gce : Maybe GCE
  , digital : Maybe Digital
  , openstack : Maybe Openstack
  , physical : Maybe Physical
  , defaults : Maybe (Dict String Defaults)
  }

emptyTemplate : Template
emptyTemplate  =
 Template "" "" "" emptyMachine Nothing Nothing Nothing Nothing Nothing Nothing

type alias Defaults = 
  {
    openstack : Maybe OpenstackDefaults
  }


emptyDefaults = 
  Dict.empty

defaultsByEnv : List String -> Dict String Defaults
defaultsByEnv envs =  
  Dict.fromList (List.map (\ env -> (env, {openstack = Just emptyOpenstackDefaults})) envs)

openstackDefaults = 
  object1 OpenstackDefaults
    (maybe ("networks" :=  list string))

defaultsDecoder : Decoder Defaults
defaultsDecoder = 
  object1 Defaults
   (maybe ("openstack" := openstackDefaults))

defaultsDictDecoder : Decoder (Dict String Defaults)
defaultsDictDecoder = 
   (dict defaultsDecoder)

decodeDefaults : String -> Dict String Defaults
decodeDefaults json =
  case Json.decodeString defaultsDictDecoder json of 
    Ok value -> 
       value
    Err error -> 
      Debug.log error emptyDefaults

templateDecoder : Decoder Template
templateDecoder = 
  map Template
    ("name" := string )
    `apply` ("type" := string )
    `apply` ("description" := string )
    `apply` ("machine" := machineDecoder)
    `apply` (maybe ("aws" := awsDecoder))
    `apply` (maybe ("gce" := gceDecoder))
    `apply` (maybe ("digital-ocean" := digitalDecoder))
    `apply` (maybe ("openstack" := openstackDecoder))
    `apply` (maybe ("physical" := physicalDecoder))
    `apply` (maybe ("defaults" := defaultsDictDecoder))
 



