module Environments.List where

import Effects exposing (Effects)
import Dict exposing (Dict)
import Common.Http exposing (getJson)

import Json.Decode as Json exposing (..)
import Http exposing (Error(BadResponse))
import Effects exposing (Effects)
import Task


-- Model 

type alias Template = 
  (Dict String String)

type alias Environment = 
  (Dict String Hypervisor)

type alias Environments = 
  Dict String Environment

type Hypervisor = 
  OSTemplates (Dict String Template)
    | Proxmox (Dict String (Dict String String))  (Dict String Template)
    | Openstack (Dict String String)  (Dict String Template)
    | AWS
    | GCE
    | Physical 
    | Empty 

-- Decoder

template : Decoder Template
template =
  dict string

node : Decoder (Dict String String)
node =
  dict string

hypervisor : Decoder Hypervisor
hypervisor = 
  oneOf [
      object2 Openstack ("flavors" := dict string) ("ostemplates" := dict template)
    , object1 OSTemplates("ostemplates" := dict template)
    , object2 Proxmox ("nodes" := dict node) ("ostemplates" := dict template)
    , succeed Physical
  ]

environment : Decoder (Dict String Hypervisor)
environment =
 (dict hypervisor)

environmentsList : Decoder Environments
environmentsList =
   at ["environments"] (dict environment)

-- Effects
getEnvironments action = 
  getJson environmentsList "/environments" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task



