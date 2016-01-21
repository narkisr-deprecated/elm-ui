module Templates.Core where

import String
import Common.Utils exposing (none)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Add as Add
import Nav.Side as NavSide exposing (Section(Stats, Launch, Add, List, View))
import Systems.Model.Common exposing (System)

type alias Model = 
  { 
   add : Add.Model
  }

init : (Model , Effects Action)
init =
  let
    (add, _) = Add.init
  in
    none (Model add)

type Action = 
  TemplatesAdd Add.Action
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
    TemplatesAdd action -> 
      let 
       (newAdd, effects) = (Add.update action model.add)
      in
       ({ model | add = newAdd }, Effects.map TemplatesAdd effects)

    _ -> 
      none model 

view : Signal.Address Action -> Model -> Section -> List Html
view address model section =
  case section of
    Add ->
      Add.view (Signal.forwardTo address TemplatesAdd) model.add

    _ -> 
     [div  [] [text "not implemented"]]
 
