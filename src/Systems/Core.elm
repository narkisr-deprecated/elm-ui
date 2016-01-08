module Systems.Core where

import Systems.List as List exposing (Error(NoSystemSelected, NoError))
import Systems.Add as Add
import Systems.View as View
import Systems.Launch as Launch exposing (Action(Cancel, SetupJob, Run))
import Nav.Side as NavSide exposing (Active(Systems, Jobs), Section(Stats, Launch, Add, List, View))
import Html exposing (..)
import Effects exposing (Effects, batch, map)
import Common.Utils exposing (none)
import Table as Table
import Set

type alias Model = 
  { systemsList : List.Model
  , systemsAdd : Add.Model
  , systemsView : View.Model
  , systemsLaunch : Launch.Model
  , navChange : Maybe (Active, Section)
  }

  
init : (Model , Effects Action)
init =
  let
     (systemsList, systemsListAction) = List.init 
     (systemsView, _) = View.init 
     (systemsAdd, systemsAddAction ) = Add.init 
     (systemsLaunch, _) = Launch.init 
     effects = [ Effects.map SystemsListing systemsListAction 
               , Effects.map SystemsAdd systemsAddAction ]
  in
    (Model systemsList systemsAdd systemsView systemsLaunch Nothing, Effects.batch effects)

type Action = 
  SystemsListing List.Action
   | SystemsAdd Add.Action
   | SystemsView View.Action
   | SystemsLaunch Launch.Action

setupJob : Launch.Action -> Model -> (Model, Effects Action)
setupJob action ({ systemsList, systemsLaunch } as model) =
  let
    (_, systems) = systemsList.systems
    table = systemsList.table
    selected = List.filter (\(id,s) -> Set.member id table.selected) systems
    selectedTable = { table | rows = selected, selected = Set.empty, id = "launchListing" }
    (newLaunch, effect) = Launch.update action { systemsLaunch |  table =  selectedTable }
  in
    if List.isEmpty selected then
      ({ model | systemsList = { systemsList | error = NoSystemSelected}} , Effects.none)
    else
      let
        newList = { systemsList | error = NoError}
      in
      ({model | systemsLaunch = newLaunch, navChange = Just (Systems, Launch), systemsList = newList}, Effects.map SystemsLaunch effect)

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
           ({model | systemsView = newSystems, navChange = Just (Systems,View)}, Effects.map SystemsView effects)        
        _ ->

          let 
            (newSystems, effect ) = List.update systemsAction systemsList
          in
            ({ model | systemsList = newSystems }, Effects.map SystemsListing effect)

    SystemsAdd systemsAction -> 
      case systemsAction of
        Add.JobLaunched _ -> 
          none model

        Add.SystemSaved next result -> 
          let
            (newSystems, effect) = Add.update systemsAction systemsAdd
          in
            if effect /= Effects.none && next == Add.NoOp then
              none {model | navChange = Just (Systems, List), systemsAdd = newSystems}
            else  
              ({model | systemsAdd = newSystems }, Effects.map SystemsAdd effect)

        _ -> 
          let 
            (newSystems, effect) = Add.update systemsAction systemsAdd
          in
            ({model | systemsAdd = newSystems }, Effects.map SystemsAdd effect)

    SystemsLaunch launchAction -> 
      case launchAction of 
        Launch.Cancel -> 
          none { model | navChange = Just (Systems,List) }

        Launch.JobLaunched _ -> 
          none {model | navChange = Just (Jobs, List)}

        SetupJob job -> 
          setupJob launchAction model

        Run job -> 
          let 
             (newLaunch, effect) = Launch.update launchAction model.systemsLaunch
          in 
           ({ model | systemsLaunch = newLaunch}, Effects.map SystemsLaunch effect)

        _ -> 
          (model, Effects.none)


view : Signal.Address Action -> Model -> Section -> List Html
view address model section =
  case section of
    List -> 
      List.view (Signal.forwardTo address SystemsListing) model.systemsList 

    Launch ->
      Launch.view (Signal.forwardTo address SystemsLaunch) model.systemsLaunch

    Add ->
      Add.view (Signal.forwardTo address SystemsAdd) model.systemsAdd

    View -> 
      View.view (Signal.forwardTo address SystemsView) model.systemsView

    _ -> 
     [div  [] [text "not implemented"]]
 
