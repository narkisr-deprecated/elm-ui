module Templates.Core exposing (..)

import String
import Common.Utils exposing (none)
import Common.Delete exposing (refresh, succeeded)

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

init : (Model, Effects Msg)
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

type Msg = 
  TemplatesAdd Add.Msg
    | TemplatesList List.Msg
    | TemplatesLaunch Launch.Msg
    | TemplatesDelete Delete.Msg
    | SetupJob (String, String)
    | NoOp


navigate : Msg -> (Model , Effects Msg) -> (Model , Effects Msg)
navigate msg ((({launch, delete} as model), effects) as result) =
  case msg of 
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

    TemplatesLaunch launchMsg -> 
       case launchMsg of
          Launch.Cancel -> 
            ({ model | navChange = Just "/templates/list" }, effects)

          Launch.JobLaunched r -> 
            ({ model | navChange = Just "/jobs/list"}, effects)

          _ -> 
            result

    TemplatesDelete deleteMsg -> 
       case deleteMsg of 
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

route : Msg ->  Model -> (Model , Effects Msg)
route msg ({add, launch, list, delete} as model) =
  case msg of 
    SetupJob (job, name) -> 
      case job of
        "launch" -> 
            none { model | launch = setName launch name }
          
        "clear" -> 
            none { model | delete = setName delete name }

        _ -> 
          none model   
 
    TemplatesAdd msg -> 
      case msg of 
        Add.Saved _ -> 
          let 
           (newAdd, effects) = (Add.update msg add)
          in
           refreshList True ({ model | add = newAdd}, Effects.map TemplatesAdd effects)

        _ -> 
         let 
          (newAdd, effects) = (Add.update msg add)
         in
          ({ model | add = newAdd }, Effects.map TemplatesAdd effects)

    TemplatesList msg -> 
      let 
        (newList, effects) = (List.update msg list)
      in
       ({ model | list = newList }, Effects.map TemplatesList effects)

    TemplatesLaunch msg -> 
      let 
         (newLaunch, effects) = (Launch.update msg launch)
      in
        ({ model | launch = newLaunch } , Effects.map TemplatesLaunch effects)

    TemplatesDelete msg -> 
      let 
        (newDelete, effects) = (Delete.update msg delete)
        success = (succeeded msg Delete.Deleted "Template deleted")
      in
        refreshList success ({ model | delete = newDelete } , Effects.map TemplatesDelete effects)

    _ -> 
      none model


update : Msg ->  Model -> (Model , Effects Msg)
update msg ({add, launch, list} as model) =
   navigate msg (route msg model)

-- Used in application Nav change
add hyp system = 
  TemplatesAdd (Add.SetSystem hyp system)

view : Model -> Route -> List (Html Msg)
view {add, list, launch, delete} route =
  case route of
    Route.Add ->
      Add.view (Signal.forwardTo TemplatesAdd) add

    Route.List ->
      List.view (Signal.forwardTo TemplatesList) list

    Route.Launch _ ->
      Launch.view (Signal.forwardTo TemplatesLaunch) launch

    Route.Delete _ ->
      Delete.view (Signal.forwardTo TemplatesDelete) delete

    Route.View _ -> 
      []
 
