module Systems.Core exposing (..)

import Systems.List as List exposing (Error(NoSystemSelected, NoError))
import Systems.Add as Add
import Systems.View as View
import Systems.Launch as Launch exposing (Action(Cancel, SetupJob, Run))
import Systems.Routing as Routing exposing (Route)
import Nav.Common exposing (Active(Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Html exposing (..)
import Platform.Cmd exposing (batch, map)
import Common.Utils exposing (none)
import Common.Redirect exposing (redirect)
import Table as Table
import Set

type alias Model = 
  { systemsList : List.Model
  , systemsAdd : Add.Model
  , systemsView : View.Model
  , systemsLaunch : Launch.Model
  , navChange : Maybe String
  }

  
addedSystem model = 
  ((toString model.systemsAdd.stage), Add.intoSystem model.systemsAdd)

init : (Model , Effects Action)
init =
  let
     (systemsList, systemsListAction) = List.init 
     (systemsView, _) = View.init 
     (systemsAdd, systemsAddAction ) = Add.init 
     (systemsLaunch, _) = Launch.init 
     effects = [ 
       Effects.map SystemsListing systemsListAction 
     , Effects.map SystemsAdd systemsAddAction 
     ]
  in
    (Model systemsList systemsAdd systemsView systemsLaunch Nothing, Effects.batch effects)

type Action = 
  SystemsListing List.Action
   | SystemsAdd Add.Action
   | SystemsView View.Action
   | SystemsLaunch Launch.Action
   | NoOp

setupJob : Launch.Action -> Model -> (Model, Effects Action)
setupJob action ({systemsList, systemsLaunch} as model) =
  let
    (_, systems) = systemsList.systems
    table = systemsList.table
    selected = List.filter (\(id,s) -> Set.member id table.selected) systems
    selectedTable = { table | rows = selected, selected = Set.empty, id = "launchListing" }
    (newLaunch, effect) = Launch.update action { systemsLaunch |  table =  selectedTable }
  in
    if List.isEmpty selected then
      none { model | systemsList = { systemsList | error = NoSystemSelected}}
    else
      let
        newList = { systemsList | error = NoError}
      in
       ({model | systemsLaunch = newLaunch, systemsList = newList, navChange = Just "systems/launch"}, Effects.map SystemsLaunch effect)

update : Action ->  Model-> (Model , Effects Action)
update action ({systemsView, systemsList, systemsAdd} as model) =
 case action of 
    SystemsView action -> 
      let
        (newSystems, effects) = View.update action systemsView
      in
        ({model | systemsView = newSystems}, Effects.map SystemsView effects)

    SystemsListing systemsAction -> 
      case systemsAction of 
        List.LoadPage (Table.View id) ->
          let 
            (newSystems, effects) = View.update (View.ViewSystem id) systemsView
          in
           ({model | systemsView = newSystems, navChange = Just("systems/view/" ++ id)}, Effects.map SystemsView effects)        
        _ ->

          let 
            (newSystems, effect ) = List.update systemsAction systemsList
          in
            ({ model | systemsList = newSystems }, Effects.map SystemsListing effect)

    SystemsAdd systemsAction -> 
      case systemsAction of
        Add.JobLaunched _ -> 
          none {model | navChange = Just "jobs/list"}

        Add.SaveTemplate -> 
          none {model | navChange = Just "templates/add"}

        Add.Saved next result -> 
          let
            (newSystems, newEffects) = Add.update systemsAction systemsAdd
            (initial, initEffects) = Add.init
          in
            -- If not the default case
            if newEffects/= Effects.none && next == Add.NoOp then
              ({model | navChange = Just "systems/list", systemsAdd = initial}, Effects.map SystemsAdd initEffects)
            else  
              ({model | systemsAdd = newSystems }, Effects.map SystemsAdd newEffects)

        _ -> 
          let 
            (newSystems, effect) = Add.update systemsAction systemsAdd
          in
            ({model | systemsAdd = newSystems }, Effects.map SystemsAdd effect)

    SystemsLaunch launchAction -> 
      case Debug.log "" launchAction of 
        Launch.Cancel -> 
          none { model | navChange = Just "systems/list"}

        Launch.JobLaunched _ -> 
          none {model | navChange = Just "jobs/list"}

        SetupJob job -> 
          setupJob launchAction model

        Run -> 
          let 
             (newLaunch, effect) = Launch.update launchAction model.systemsLaunch
          in 
           ({ model | systemsLaunch = newLaunch}, Effects.map SystemsLaunch effect)

        _ -> 
          none model

    NoOp -> 
      none model


view : Signal.Address Action -> Model -> Route -> List Html
view address model route =
  case route of
    Routing.List -> 
      List.view (Signal.forwardTo address SystemsListing) model.systemsList 

    Routing.Launch ->
      Launch.view (Signal.forwardTo address SystemsLaunch) model.systemsLaunch

    Routing.Add ->
      Add.view (Signal.forwardTo address SystemsAdd) model.systemsAdd

    Routing.View _ -> 
      View.view (Signal.forwardTo address SystemsView) model.systemsView

    _ -> 
     [div  [] [text "not implemented"]]
 
