module Templates.Core where

import String
import Common.Utils exposing (none)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Add as Add
import Templates.List as List
import Templates.Launch as Launch
import Nav.Side as NavSide exposing (Active(Templates), Section(Add, Launch, List))
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

navigate : Action -> (Model , Effects Action) -> (Model , Effects Action)
navigate action ((({launch} as model), effects) as result) =
  case action of 
    TemplatesAdd add -> 
      case add of 
        Add.Saved _ -> 
          ({ model | navChange = Just (Templates, List) }, effects)

        Add.Cancel -> 
          ({ model | navChange = Just (Templates, List)}, effects)

        _ -> 
          result

    TemplatesLaunch launchAction -> 
       case launchAction of
         Launch.Cancel -> 
          ({ model | navChange = Just (Templates, List)}, effects)

         Launch.Deleted _ -> 
           if launch.state /= (Launch.Errored "Failed to delete template") then
             ({ model | navChange = Just (Templates, List)}, effects)
           else
             result

         Launch.SetupJob (_,_) -> 
          ({ model | navChange = Just (Templates, Launch) }, effects)
          
         _ -> 
           result

    _ -> 
      result



route : Action ->  Model -> (Model , Effects Action)
route action ({add, launch, list} as model) =
  case action of 
    TemplatesAdd action -> 
      case action of 
        Add.Saved _ -> 
          let 
           (newAdd, addEffects) = (Add.update action add)
           (newList, listEffects) = List.init
           effects = [
             Effects.map TemplatesAdd addEffects
           , Effects.map TemplatesList listEffects
           ]
          in
           ({ model | add = newAdd},Effects.batch effects )

        _ -> 
         let 
          (newAdd, effects) = (Add.update action add)
         in
          ({ model | add = newAdd }, Effects.map TemplatesAdd effects)

    TemplatesList action -> 
      let 
        (newList, effects) = (List.update action list)
      in
       ({ model | list = newList }, Effects.map TemplatesList effects)

    TemplatesLaunch action -> 
      let 
         (newLaunch, launchEffects) = (Launch.update action launch)
         (newList, listEffects) = List.init
         effects = [
           Effects.map TemplatesLaunch launchEffects
         , Effects.map TemplatesList listEffects
         ]
      in
         ({ model | launch = newLaunch } , Effects.batch effects )

    _ -> 
      none model


update : Action ->  Model -> (Model , Effects Action)
update action ({add, launch, list} as model) =
   navigate action (route action model)

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
 
