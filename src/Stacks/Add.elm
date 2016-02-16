module Stacks.Add where

import Effects exposing (Effects)
import Html exposing (..)
import Common.Components exposing (panel, panelContents)
import Html.Attributes exposing (class)
import Common.DualList exposing (loadList)
import Debug


type alias Model = 
  {}
 
init : (Model , Effects Action)
init =
  Debug.log "init" (Model, Effects.none)

-- Update 

type Action = 
  LoadList 
   | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   
   LoadList -> 
    (model, loadList NoOp ["foo"])

   NoOp -> 
     (model, Effects.none)

-- View

addView address model =
   div [] [ 
     h4 [] [text "Add a stack"]
   , div  [class "dualList"] []
   ]

view : Signal.Address Action -> Model -> Html
view address model =
  panel (panelContents (addView address model))
