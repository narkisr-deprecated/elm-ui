module Stacks.Add where

import Effects exposing (Effects)
import Html exposing (..)
import Common.Components exposing (panel, panelContents, infoCallout, info, onSelect)
import Html.Attributes exposing (class, multiple)
import Common.DualList exposing (loadList)
import Common.Utils exposing (none)
import Debug


type alias Model = 
  {}
 
init : (Model , Effects Action)
init =
  (Model, Effects.none)

-- Update 

type Action = 
  LoadList 
   | Select (List String)
   | Save
   | Cancel
   | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   LoadList -> 
    (model, loadList NoOp)

   Select templates -> 
     none model  

   _ -> 
     none model

-- View

addView address model =
  select [class "dualList", multiple True] 
    (List.map (\opt -> option [] [text opt]) ["foo", "bar"])

view : Signal.Address Action -> Model -> Html
view address model =
  div [] 
    (infoCallout address (info "Select templates to add" ) (panel (panelContents (addView address model))) Cancel Save)
