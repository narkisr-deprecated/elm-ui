module Systems.View where

import Systems.View.AWS  as AWSView
import Effects exposing (Effects)
import Html exposing (..)



-- Model 
type alias Model = 
  {
   }

init : (Model , Effects Action)
init =
  (Model, Effects.none)

-- Update
type Action = 
  ViewAWS String

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of
    ViewAWS id -> 
      (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> List Html
view address model =
  [div  [] [text "viewing system"]]
