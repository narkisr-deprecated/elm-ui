module Templates.Core exposing (..)

import String
import Common.Utils exposing (none)
import Common.Delete exposing (refresh, succeeded)
import Common.Components exposing (notImplemented)

import Html exposing (..)
import Html.App as App
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

init : (Model, Cmd Msg)
init =
  let
    (add, addEffects) = Add.init
    (list, listEffects) = List.init
    (launch, launchEffects) = Launch.init
    (delete, deleteEffects) = Delete.init
    msgs = [
      Cmd.map TemplatesAdd addEffects
    , Cmd.map TemplatesList listEffects
    , Cmd.map TemplatesLaunch launchEffects
    , Cmd.map TemplatesDelete deleteEffects
    ]
  in
    (Model add list launch delete Nothing, Cmd.batch msgs)

type Msg =
  TemplatesAdd Add.Msg
    | TemplatesList List.Msg
    | TemplatesLaunch Launch.Msg
    | TemplatesDelete Delete.Msg
    | SetupJob (String, String)
    | NoOp


navigate : Msg -> (Model , Cmd Msg) -> (Model , Cmd Msg)
navigate msg ((({launch, delete} as model), msgs) as result) =
  case msg of
    SetupJob (job,id) ->
       case job of
         "launch" ->
            ({ model | navChange = Just ("/templates/launch/" ++ id) }, msgs)

         "clear" ->
            ({ model | navChange = Just ("/templates/delete/" ++ id ) }, msgs)

         _ ->
           result

    TemplatesAdd add ->
      case add of
        Add.Saved (Result.Ok _) ->
          ({ model | navChange = Just "/templates/list" }, msgs)

        Add.Cancel ->
          ({ model | navChange = Just "/templates/list"}, msgs)

        Add.Done ->
          ({ model | navChange = Just "/templates/list"}, msgs)

        _ ->
          result

    TemplatesLaunch launchMsg ->
       case launchMsg of
          Launch.Cancel ->
            ({ model | navChange = Just "/templates/list" }, msgs)

          Launch.JobLaunched r ->
            ({ model | navChange = Just "/jobs/list"}, msgs)

          _ ->
            result

    TemplatesDelete deleteMsg ->
       case deleteMsg of
          Delete.Deleted _  ->
           if delete.errorMsg == "" then
             ({ model | navChange = Just "/templates/list"}, msgs)
           else
             result

          Delete.Cancel ->
            refreshList True ({ model | navChange = Just "/templates/list"}, msgs)

          Delete.Done ->
            refreshList True ({ model | navChange = Just "/templates/list"}, msgs)

          _ ->
            result
    _ ->
      result

setName model name =
  { model | name = name }

refreshList =
  refresh List.init TemplatesList

route : Msg ->  Model -> (Model , Cmd Msg)
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
           (newAdd, msgs) = (Add.update msg add)
          in
           refreshList True ({ model | add = newAdd}, Cmd.map TemplatesAdd msgs)

        _ ->
         let
          (newAdd, msgs) = (Add.update msg add)
         in
          ({ model | add = newAdd }, Cmd.map TemplatesAdd msgs)

    TemplatesList msg ->
      let
        (newList, msgs) = (List.update msg list)
      in
       ({ model | list = newList }, Cmd.map TemplatesList msgs)

    TemplatesLaunch msg ->
      let
         (newLaunch, msgs) = (Launch.update msg launch)
      in
        ({ model | launch = newLaunch } , Cmd.map TemplatesLaunch msgs)

    TemplatesDelete msg ->
      let
        (newDelete, msgs) = (Delete.update msg delete)
        success = (succeeded msg Delete.Deleted "Template deleted")
      in
        refreshList success ({ model | delete = newDelete } , Cmd.map TemplatesDelete msgs)

    _ ->
      none model


update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({add, launch, list} as model) =
   navigate msg (route msg model)

-- Used in application Nav change
add hyp system =
  TemplatesAdd (Add.SetSystem hyp system)

view : Model -> Route -> Html Msg
view {add, list, launch, delete} route =
  case route of
    Route.Add ->
      App.map TemplatesAdd (Add.view add)

    Route.List ->
      App.map TemplatesList (List.view list)

    Route.Launch _ ->
      App.map TemplatesLaunch (Launch.view launch)

    Route.Delete _ ->
      App.map TemplatesDelete (Delete.view delete)

    Route.View _ ->
      notImplemented

