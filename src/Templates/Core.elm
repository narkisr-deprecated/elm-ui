module Templates.Core where

import String
import Common.Utils exposing (none)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Add as Add
import Templates.List as List
import Templates.Launch as Launch
import Nav.Side as NavSide exposing (Active(Templates), Section(Stats, Launch, Add, List, View))
import Systems.Model.Common exposing (System)

type alias Model = 
  { 
    add : Add.Model
  , list: List.Model
  , launch: Launch.Model
  , navChange : Maybe (Active, Section)
  }

init : (Model, Effects Action)
init =
  let
    (add, addEffects) = Add.init
    (list, listEffects) = List.init
    (launch, launchEffects) = Launch.init
    effects = [
      Effects.map TemplatesAdd addEffects
    , Effects.map TemplatesList listEffects
    , Effects.map TemplatesLaunch launchEffects
    ]
  in
    (Model add list launch Nothing, Effects.batch effects)

type Action = 
  TemplatesAdd Add.Action
    | TemplatesList List.Action
    | TemplatesLaunch Launch.Action
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action ({launch, list} as model) =
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

        Add.Cancel -> 
          none { model | navChange = Just (Templates, List)}

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

    TemplatesLaunch action -> 
      case action of 
        Launch.SetupJob (job, name) -> 
          let
            template = List.findTemplate list name
            (newLaunch,effects) = Launch.update (Launch.SetTemplate template) launch
            newModel = { model | launch = newLaunch, navChange = Just (Templates, Launch) }
          in
            (newModel , Effects.map TemplatesLaunch effects)

        Launch.Cancel -> 
          none { model | navChange = Just (Templates, List)}

        _ -> 
          let 
            (newLaunch, effects) = (Launch.update action model.launch)
            newModel = { model | launch = newLaunch }
          in
            (newModel , Effects.map TemplatesLaunch effects)


    _ -> 
      none model

add hyp system = 
  TemplatesAdd (Add.SetSystem hyp system)

view : Signal.Address Action -> Model -> Section -> List Html
view address {add, list, launch} section =
  case section of
    Add ->
      Add.view (Signal.forwardTo address TemplatesAdd) add

    List ->
      List.view (Signal.forwardTo address TemplatesList) list

    Launch ->
      Launch.view (Signal.forwardTo address TemplatesLaunch) launch


    _ -> 
     [div  [] [text "not implemented"]]
 
