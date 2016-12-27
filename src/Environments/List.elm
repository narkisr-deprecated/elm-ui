module Environments.List exposing (..)

import Dict exposing (Dict)
import Common.Http exposing (getJson)
import Basics.Extra exposing (never)
import Common.Model exposing (Options, option)
import Json.Decode as Json exposing (..)
import Http exposing (Error(BadResponse))
import Task


-- Model


type alias Template =
    Dict String String


type alias Environment =
    Dict String Hypervisor


type alias Environments =
    Dict String Environment


type Hypervisor
    = OSTemplates (Dict String Template)
    | Proxmox (Dict String (Dict String String)) (Dict String Template)
    | Openstack (Dict String String) (Dict String Template)
    | KVM (Dict String Template) (Dict String (Dict String Options))
    | AWS
    | GCE
    | Physical
    | Empty



-- Decoder


template : Decoder Template
template =
    dict string


hypervisor : Decoder Hypervisor
hypervisor =
    oneOf
        [ object2 Openstack ("flavors" := dict string) ("ostemplates" := dict template)
        , object2 KVM ("ostemplates" := dict template) ("nodes" := dict (dict (option ())))
        , object1 OSTemplates ("ostemplates" := dict template)
        , succeed Physical
        ]


environment : Decoder (Dict String Hypervisor)
environment =
    (dict hypervisor)


environmentsList : Decoder Environments
environmentsList =
    at [ "environments" ] (dict environment)



-- Effects


getEnvironments msg =
    getJson environmentsList "/environments"
        |> Task.toResult
        |> Task.perform never msg


environmentsKeys : Decoder (List String)
environmentsKeys =
    at [ "environments" ] (list string)


getEnvironmentKeys msg =
    getJson environmentsKeys "/environments/keys"
        |> Task.toResult
        |> Task.perform never msg
