module Systems.View where

import Effects exposing (Effects)
import Systems.Model.Common exposing (System, Machine, emptySystem)
import Systems.Model.AWS exposing (emptyAws)
import Common.Http exposing (getJson)

-- Effects
import Task
import Http exposing (Error(BadResponse))
import Systems.Decoders exposing (systemDecoder)
import Common.Redirect exposing (successHandler)

-- View
import Common.Components exposing (panelContents)
import Html exposing (..)
import Systems.View.AWS  as AWSView
import Systems.View.Openstack as OpenstackView
import Systems.View.GCE as GCEView
import Systems.View.Digital as DigitalView

import Maybe exposing (withDefault)

-- Model 
type alias Model = 
  {
    system : System
   }

init : (Model , Effects Action)
init =
  (Model emptySystem, Effects.none)

-- Update
type Action = 
  ViewSystem String
    | SetSystem (Result Http.Error System)
    | NoOp

setSystem : Model -> System -> (Model , Effects Action)
setSystem model system =
  ({model | system = system}, Effects.none)

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of
    ViewSystem id -> 
      (model, getSystem id )

    SetSystem result -> 
      successHandler result model (setSystem model) NoOp
      
    NoOp -> 
      (model, Effects.none)
      
-- View

toHtml title ({system} as model) f prop= 
  case prop of
    Just value -> 
       panelContents title (div [] (f (value, system.machine)))
    Nothing -> 
       []

view : Signal.Address Action -> Model -> List Html
view address ({system} as model) =
    let
      options = [ toHtml "AWS system" model AWSView.summarize system.aws
                , toHtml "GCE system" model GCEView.summarize system.gce
                , toHtml "Openstack system" model OpenstackView.summarize system.openstack
                , toHtml "Digital system" model DigitalView.summarize system.digital]

    in 
      withDefault [div  [] [text "not implemented"]] (List.head (List.filter (not << List.isEmpty) options))

-- Effects

getSystem : String -> Effects Action
getSystem id = 
  getJson systemDecoder ("/systems/" ++ id)
    |> Task.toResult
    |> Task.map SetSystem
    |> Effects.task

