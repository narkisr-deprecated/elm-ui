module Types.Edit where

import Common.Http exposing (postJson)
import Http exposing (Error(BadResponse))
import Effects exposing (Effects)
import Common.Http exposing (postJson, SaveResponse, saveResponse)
import Common.Components exposing (asList)
import Html exposing (..)


type alias Model = 
  {}
 
init : (Model , Effects Action)
init =
  (Model, Effects.none)

-- Update 

type Action = 
  NoOp
   | Saved (Result Http.Error SaveResponse)

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   _ -> 
     (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> List Html
view address model =
  asList (div [] [ text "editing type" ])
