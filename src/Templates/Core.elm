module Templates.Core where

import String
import Common.Utils exposing (none)
import Common.Delete exposing (refresh, succeeded)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Add as Add
import Templates.List as List
import Templates.Launch as Launch
import Templates.Delete as Delete
import Templates.Routing as Route exposing (Route)
import Systems.Model.Common exposing (System)

type alias Model = 
  { 
    add : Add.Model
  , list: List.Model
  , launch: Launch.Model
  , delete: Delete.Model
  , navChange : Maybe String
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
    SetupJob (job,id) -> 
       case job of 
         "launch" -> 
            ({ model | navChange = Just ("/templates/launch/" ++ id) }, effects)
          
         "clear" -> 
            ({ model | navChange = Just ("/templates/delete/" ++ id ) }, effects)

         _ -> 
           result
          
    TemplatesAdd add -> 
      case add of 
        Add.Saved (Result.Ok _) -> 
          ({ model | navChange = Just "/templates/list" }, effects)

        Add.Cancel -> 
          ({ model | navChange = Just "/templates/list"}, effects)

        Add.Done -> 
          ({ model | navChange = Just "/templates/list"}, effects)

        _ -> 
          result

    TemplatesLaunch launchAction -> 
       case launchAction of
          Launch.Cancel -> 
            ({ model | navChange = Just "/templates/list" }, effects)

          Launch.JobLaunched r -> 
            ({ model | navChange = Just "/jobs/list"}, effects)

          _ -> 
            result

    TemplatesDelete deleteAction -> 
       case deleteAction of 
          Delete.Deleted _  -> 
           if delete.errorMsg == "" then
             ({ model | navChange = Just "/templates/list"}, effects)
           else
             result

          Delete.Cancel -> 
            refreshList True ({ model | navChange = Just "/templates/list"}, effects)

          Delete.Done -> 
            refreshList True ({ model | navChange = Just "/templates/list"}, effects)
         
          _ -> 
            result
    _ -> 
      result

setName model name = 
  { model | name = name } 

refreshList = 
  refresh List.init TemplatesList

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
        success = (succeeded action Delete.Deleted "Template deleted")
      in
        refreshList success ({ model | delete = newDelete } , Effects.map TemplatesDelete effects)

    _ -> 
      none model


update : Action ->  Model -> (Model , Effects Action)
update action ({add, launch, list} as model) =
   navigate action (route action model)

-- Used in application Nav change
add hyp system = 
  TemplatesAdd (Add.SetSystem hyp system)

view : Signal.Address Action -> Model -> Route -> List Html
view address {add, list, launch, delete} route =
  case route of
    Route.Add ->
      Add.view (Signal.forwardTo address TemplatesAdd) add

    Route.List ->
      List.view (Signal.forwardTo address TemplatesList) list

    Route.Launch _ ->
      Launch.view (Signal.forwardTo address TemplatesLaunch) launch

    Route.Delete _ ->
      Delete.view (Signal.forwardTo address TemplatesDelete) delete

    Route.View _ -> 
      []
 
