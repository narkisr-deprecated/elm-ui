module Systems.Add.Common exposing (..)

import Bootstrap.Html exposing (..)
import Html exposing (..)
import Html.Events exposing (onClick)

import Maybe exposing (withDefault)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(OSTemplates))
import Dict exposing (Dict)
import String

getOses hyp model =
  let 
    hypervisor = withDefault ENV.Empty (Dict.get hyp model.environment)
  in 
    case hypervisor of
      OSTemplates oses -> 
        oses

      ENV.Openstack flavors oses -> 
        oses

      ENV.KVM oses _ -> 
        oses

      _ -> 
        Dict.empty


setDefaultOS hyp ({machine} as model) = 
   case List.head (Dict.keys (getOses hyp model)) of
     Just os -> 
       if (String.isEmpty machine.os) then
         { model | machine = {machine | os = os }}
       else 
         model

     Nothing -> 
       model

setMachine f ({machine} as model) =
  let
    newMachine = f machine
  in
   { model | machine = newMachine }


