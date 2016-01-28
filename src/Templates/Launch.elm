module Templates.Launch where

import Effects exposing (Effects)
import Html exposing (..)


type alias Model = 
  {
    job : String 
  }
 
init : (Model , Effects Action)
init =
  (Model "", Effects.none)

-- Update 

type Action = 
  SetupJob String 
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
    SetupJob job ->
      ({ model | job = job }, Effects.none)


    NoOp -> 
      (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> Html
view address model =
  div [] [
    text "not implemented"
  ]
