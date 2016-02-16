module Stacks.Add where

import Effects exposing (Effects)
import Html exposing (..)


type alias Model = 
  {}
 
init : (Model , Effects Action)
init =
  (Model, Effects.none)

-- Update 

type Action = 
  NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   NoOp -> 
     (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> Html
view address model =
  div [] [
     text "add"
  ]
