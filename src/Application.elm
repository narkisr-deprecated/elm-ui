module Application where

import Html exposing (..)
import Effects exposing (Effects, Never, batch, map)
import Set

import Systems.List as SystemsList exposing (Error(NoSystemSelected, NoError))
import Systems.Add as Add
import Systems.View as SystemsView
import Systems.Launch as Launch exposing (Action(Cancel, SetupJob, Run))
import Jobs.List exposing (Action(Polling))
import Jobs.Stats
import Types.List as Types
import Table as Table
import Nav.Side as Nav exposing (view, Active(Types, Systems, Jobs), Section(Stats, Launch, Add, List, View))
import Nav.Header exposing (mainHeader)

import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src)
import Bootstrap.Html exposing (..)
import Debug

init : (Model, Effects Action)
init =
  let 
    (systemsList, systemsListAction) = SystemsList.init 
    (systemsView, _) = SystemsView.init 
    (systemsAdd, systemsAddAction ) = Add.init 
    (systemsLaunch, _) = Launch.init 
    (jobsList, jobsListAction) = Jobs.List.init
    (jobsStat, jobsStatAction) = Jobs.Stats.init
    (typesModel, typesAction)  = Types.init 
    effects = [ Effects.map SystemsListing systemsListAction
              , Effects.map TypesAction typesAction
              , Effects.map JobsList jobsListAction
              , Effects.map JobsStats jobsStatAction
              , Effects.map SystemsAdd systemsAddAction]
  in
    (Model systemsList systemsAdd systemsView systemsLaunch jobsList jobsStat typesModel Nav.init , Effects.batch effects) 

type alias Model = 
  { systemsList : SystemsList.Model
  , systemsAdd : Add.Model
  , systemsView : SystemsView.Model
  , systemsLaunch : Launch.Model
  , jobsList : Jobs.List.Model
  , jobsStats : Jobs.Stats.Model
  , types : Types.Model, nav : Nav.Model }


type Action = 
     SystemsListing SystemsList.Action
   | SystemsAdd Add.Action
   | SystemsView SystemsView.Action
   | SystemsLaunch Launch.Action
   | JobsList Jobs.List.Action
   | JobsStats Jobs.Stats.Action
   | TypesAction Types.Action
   | NavAction Nav.Action

setupJob : Launch.Action -> Model -> (Model, Effects Action)
setupJob action ({ systemsList, systemsLaunch } as model) =
  let
    (_, systems) = systemsList.systems
    table = systemsList.table
    selected = List.filter (\(id,s) -> Set.member id table.selected) systems
    selectedTable = { table | rows = selected, selected = Set.empty, id = "launchListing" }
    (newLaunch, effect) = Launch.update action { systemsLaunch |  table =  selectedTable }
    newNav = Nav.update (Nav.Goto Systems Launch) model.nav
  in
    if List.isEmpty selected then
      ({ model | systemsList = { systemsList | error = NoSystemSelected}} , Effects.none)
    else
      ({ model | systemsLaunch = newLaunch, nav = newNav, systemsList = { systemsList | error = NoError}}, Effects.map SystemsLaunch effect)

jobListing : Model -> (Model , Effects Action)
jobListing ({nav} as model) = 
  let
    (newJobs, effects) = Jobs.List.init
    newNav = Nav.update (Nav.Goto Jobs List) nav
  in 
    ({model | nav = newNav , jobsList = newJobs}, Effects.map JobsList effects)

systemListing : Model -> (Model , Effects Action)
systemListing ({nav} as model) = 
  ({model |  nav = Nav.update (Nav.Goto Systems List) nav}, Effects.none)

update : Action ->  Model-> (Model , Effects Action)
update action ({nav, systemsList, systemsAdd, jobsList, jobsStats, systemsView} as model) =
  case action of 
    SystemsView action -> 
      let
        (newSystems, effects) = SystemsView.update action systemsView
      in
        ({model | systemsView = newSystems}, Effects.map SystemsView effects)

    SystemsListing systemsAction -> 
      case systemsAction of 
        SystemsList.LoadPage (Table.View id) ->
          let 
            (newSystems, effects) = SystemsView.update (SystemsView.ViewSystem id) systemsView
          in
           ({model | systemsView = newSystems,  nav = Nav.update (Nav.Goto Systems View) nav}, Effects.map SystemsView effects)        
        _ ->
          let 
            (newSystems, effect ) = SystemsList.update systemsAction systemsList
          in
            ({ model | systemsList = newSystems }, Effects.map SystemsListing effect)

    SystemsAdd systemsAction -> 
      case systemsAction of
        Add.JobLaunched _ -> 
          jobListing model

        Add.SystemSaved next result -> 
          let
            (newSystems, effect) = Add.update systemsAction systemsAdd
          in
            if effect /= Effects.none && next == Add.NoOp then
              systemListing {model | systemsAdd = newSystems}
            else  
              ({model | systemsAdd = newSystems }, Effects.map SystemsAdd effect)

        _ -> 
          let 
            (newSystems, effect) = Add.update systemsAction systemsAdd
          in
            ({model | systemsAdd = newSystems }, Effects.map SystemsAdd effect)

    SystemsLaunch launchAction -> 
      case launchAction of 
        Cancel -> 
          systemListing model

        Launch.JobLaunched _ -> 
          jobListing model

        SetupJob job -> 
          setupJob launchAction model

        Run job -> 
          let 
             (newLaunch, effect) = Launch.update launchAction model.systemsLaunch
          in 
           ({ model | systemsLaunch = newLaunch}, Effects.map SystemsLaunch effect)

        _ -> 
          Debug.log (toString launchAction) (model, Effects.none)

    JobsList jobAction -> 
      if jobAction == Polling && nav.active /= Jobs then
        (model, Effects.none)
      else
        let 
          (newJobList, effects) = Jobs.List.update jobAction jobsList 
        in
          ({model | jobsList = newJobList}, Effects.map JobsList effects) 

    JobsStats jobAction -> 
      let 
        (newJobsStats, effects) = Jobs.Stats.update jobAction jobsStats
      in
        ({model | jobsStats= newJobsStats }, Effects.map JobsStats effects) 

    NavAction navAction -> 
      let 
        newNav = Nav.update navAction model.nav
        (newModel, effects) = init
      in
        ({ newModel | jobsStats = jobsStats, nav = newNav }, effects)

    TypesAction _ -> 
      (model, Effects.none) 

activeView : Signal.Address Action -> Model -> List Html
activeView address ({jobsList, jobsStats} as model) =
  case model.nav.active of
   Systems -> 
     case model.nav.section of
       List -> 
         SystemsList.view (Signal.forwardTo address SystemsListing) model.systemsList 

       Launch ->
         Launch.view (Signal.forwardTo address SystemsLaunch) model.systemsLaunch

       Add ->
         Add.view (Signal.forwardTo address SystemsAdd) model.systemsAdd

       View -> 
         SystemsView.view (Signal.forwardTo address SystemsView) model.systemsView

       _ -> 
           []
   Types -> 
     Types.view (Signal.forwardTo address TypesAction) model.types

   Jobs -> 
     case model.nav.section of
       List ->
         Jobs.List.view (Signal.forwardTo address JobsList) jobsList

       Stats ->
         Jobs.Stats.view (Signal.forwardTo address JobsStats) jobsStats

       _ ->
           []

view : Signal.Address Action -> Model -> Html
view address model = 
  div [ class "wrapper" ] 
    (List.append
       (List.append (mainHeader) (Nav.view (Signal.forwardTo address NavAction) model.nav))
       [div [class "content-wrapper"]
         [section [class "content"] (activeView address model)]])

