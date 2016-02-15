module Templates.Core where

import String
import Common.Utils exposing (none)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Add as Add
import Templates.List as List
import Templates.Launch as Launch
import Templates.Delete as Delete
import Nav.Side as NavSide exposing (Active(Templates, Jobs), Section(Add, Launch, List, Delete))
import Systems.Model.Common exposing (System)

type alias Model = 
  { 
    add : Add.Model
  , list: List.Model
  , launch: Launch.Model
  , delete: Delete.Model
  , navChange : Maybe (Active, Section)
  }

init : (Model, Effects Action)
init =
  let
    (add, addEffects) = Add.init
    (list, listEffects) = List.init
    (launch, launchEffects) = Launch.init
    (delete, deleteEffects) = Delete.init
    effects = [
      Effects.map TemplatesAdd addEffects
    , Effects.map TemplatesList listEffects
    , Effects.map TemplatesLaunch launchEffects
    , Effects.map TemplatesDelete deleteEffects
    ]
  in
    (Model add list launch delete Nothing, Effects.batch effects)

type Action = 
  TemplatesAdd Add.Action
    | TemplatesList List.Action
    | TemplatesLaunch Launch.Action
    | TemplatesDelete Delete.Action
    | SetupJob (String, String)
    | NoOp


navigate : Action -> (Model , Effects Action) -> (Model , Effects Action)
navigate action ((({launch, delete} as model), effects) as result) =
  case action of 
    SetupJob (job,_) -> 
       case job of 
         "launch" -> 
            ({ model | navChange = Just (Templates, Launch) }, effects)
          
         "clear" -> 
            ({ model | navChange = Just (Templates, Delete) }, effects)

         _ -> 
           result
          
    TemplatesAdd add -> 
      case add of 
        Add.Saved (Result.Ok _) -> 
          ({ model | navChange = Just (Templates, List) }, effects)

        Add.Cancel -> 
          ({ model | navChange = Just (Templates, List)}, effects)

        Add.Done -> 
          ({ model | navChange = Just (Templates, List)}, effects)

        _ -> 
          result

    TemplatesLaunch launchAction -> 
       case launchAction of
          Launch.Cancel -> 
            ({ model | navChange = Just (Templates, List)}, effects)

          Launch.JobLaunched r -> 
            ({ model | navChange = Just (Jobs, List)}, effects)

          _ -> 
            result

    TemplatesDelete deleteAction -> 
       case deleteAction of 
          Delete.Deleted _  -> 
           if delete.error == "" then
             ({ model | navChange = Just (Templates, List)}, effects)
           else
             result

          Delete.Cancel -> 
            refreshList True ({ model | navChange = Just (Templates, List)}, effects)

          Delete.Done -> 
            refreshList True ({ model | navChange = Just (Templates, List)}, effects)
         
          _ -> 
            result
    _ -> 
      result

setName model name = 
  { model | name = name } 

refreshList : Bool -> (Model , Effects Action) -> (Model , Effects Action)
refreshList succeeded ((model, effect) as original) =
  if succeeded then
    let 
      (_ , listEffects) = List.init
      effects = [effect , Effects.map TemplatesList listEffects ]
    in
      (model ,Effects.batch effects)
  else 
    original


route : Action ->  Model -> (Model , Effects Action)
route action ({add, launch, list, delete} as model) =
  case action of 
    SetupJob (job, name) -> 
      case job of
        "launch" -> 
            none { model | launch = setName launch name }
          
        "clear" -> 
            none { model | delete = setName delete name }

        _ -> 
          none model   
 
    TemplatesAdd action -> 
      case action of 
        Add.Saved _ -> 
          let 
           (newAdd, effects) = (Add.update action add)
          in
           refreshList True ({ model | add = newAdd}, Effects.map TemplatesAdd effects)

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
         (newLaunch, effects) = (Launch.update action launch)
      in
        ({ model | launch = newLaunch } , Effects.map TemplatesLaunch effects)

    TemplatesDelete action -> 
      let 
        (newDelete, effects) = (Delete.update action delete)
      in
        refreshList (Delete.succeeded action newDelete) ({ model | delete = newDelete } , Effects.map TemplatesDelete effects)

    _ -> 
      none model


update : Action ->  Model -> (Model , Effects Action)
update action ({add, launch, list} as model) =
   navigate action (route action model)

add hyp system = 
  TemplatesAdd (Add.SetSystem hyp system)

view : Signal.Address Action -> Model -> Section -> List Html
view address {add, list, launch, delete} section =
  case section of
    Add ->
      Add.view (Signal.forwardTo address TemplatesAdd) add

    List ->
      List.view (Signal.forwardTo address TemplatesList) list

    Launch ->
      Launch.view (Signal.forwardTo address TemplatesLaunch) launch

    Delete ->
      Delete.view (Signal.forwardTo address TemplatesDelete) delete

    _ -> 
     [div  [] [text "not implemented"]]
 
