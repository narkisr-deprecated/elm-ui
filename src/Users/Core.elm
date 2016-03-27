module Users.Core where

import Effects exposing (Effects)
import Html exposing (..)
import Nav.Common exposing (Section(Add, List, View))
import Users.List as List exposing (Action)
import Common.Utils exposing (none)



type alias Model = 
  {
   list : List.Model 
  }
 
init : (Model , Effects Action)
init =
  let 
    (list, listActions) = List.init
  in 
    (Model list, Effects.map Listing listActions)

-- Update 

type Action = 
  Listing List.Action
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action ({list} as model) =
  case action of 
   Listing listing -> 
     let
       (newList, effects) =  List.update listing list 
     in
        ({model | list = newList }, Effects.map Listing effects)

   _ -> 
     none model

-- View

view : Signal.Address Action -> Model -> Section -> List Html
view address ({list} as model) section =
  case section of 
     List -> 
       List.view (Signal.forwardTo address Listing) list

     _ -> 
       [div [] [text "not implemented"]]
