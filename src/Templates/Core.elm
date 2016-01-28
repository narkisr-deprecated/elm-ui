module Templates.Core where

import String
import Common.Utils exposing (none)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Add as Add
import Templates.List as List
import Nav.Side as NavSide exposing (Active(Templates), Section(Stats, Launch, Add, List, View))
import Systems.Model.Common exposing (System)

type alias Model = 
  { 
    add : Add.Model
  , list: List.Model
  , navChange : Maybe (Active, Section)
  }

init : (Model , Effects Action)
init =
  let
    (add, addEffects) = Add.init
    (list, listEffects) = List.init
    effects = [
      Effects.map TemplatesAdd addEffects
    , Effects.map TemplatesList listEffects
    ]
  in
    (Model add list Nothing, Effects.batch effects)

type Action = 
  TemplatesAdd Add.Action
    | TemplatesList List.Action
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
    TemplatesAdd action -> 
      case action of 
        Add.Saved _ -> 
          let 
           (newAdd, addEffects) = (Add.update action model.add)
           (newList, listEffects) = List.init
           effects = [
             Effects.map TemplatesAdd addEffects
           , Effects.map TemplatesList listEffects
           ]
          in
            ({ model | add = newAdd, navChange = Just (Templates, List)},Effects.batch effects )
        _ -> 
         let 
          (newAdd, effects) = (Add.update action model.add)
         in
          ({ model | add = newAdd }, Effects.map TemplatesAdd effects)

    TemplatesList action -> 
      let 
        (newList, effects) = (List.update action model.list)
      in
       ({ model | list = newList }, Effects.map TemplatesList effects)


    _ -> 
      none model

add hyp system = 
  TemplatesAdd (Add.SetSystem hyp system)

view : Signal.Address Action -> Model -> Section -> List Html
view address {add, list} section =
  case section of
    Add ->
      Add.view (Signal.forwardTo address TemplatesAdd) add

    List ->
      List.view (Signal.forwardTo address TemplatesList) list


    _ -> 
     [div  [] [text "not implemented"]]
 
