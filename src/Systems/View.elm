module Systems.View where

import Effects exposing (Effects)
import Systems.Model.Common exposing (System, Machine)
import Systems.Model.AWS exposing (emptyAws)

-- Effects
import Task
import Http exposing (Error(BadResponse))
import Systems.Decoders exposing (systemDecoder)
import Common.Redirect exposing (successHandler)

-- View
import Common.Components exposing (panelContents)
import Html exposing (..)
import Systems.View.AWS  as AWSView
import Systems.View.GCE as GCEView

-- Model 
type alias Model = 
  {
    system : System
   }

init : (Model , Effects Action)
init =
  let
    emptySystem = System "" "" "" (Machine  "" "" "" (Just "") "") Nothing Nothing
  in
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

view : Signal.Address Action -> Model -> List Html
view address ({system} as model) =
  case system.aws of
    Just aws ->
     panelContents "AWS system" (div [] (AWSView.summarize (aws, system.machine)))

    Nothing ->
      case system.gce of
        Just gce ->
          panelContents "GCE system" (div [] (GCEView.summarize (gce, system.machine)))

        Nothing -> 
          [div  [] [text "not implemented"]]
  
-- Effects

getSystem : String -> Effects Action
getSystem id = 
  Http.get systemDecoder ("/systems/" ++ id)
    |> Task.toResult
    |> Task.map SetSystem
    |> Effects.task

