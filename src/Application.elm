module Application where

import Html exposing (..)
import Effects exposing (Effects, Never, batch, map)
import Set

import Systems.List as SystemsList exposing (Error(NoSystemSelected, NoError))
import Systems.Add as Add
import Systems.Launch as Launch exposing (Action(Cancel, SetupJob, Run))
import Jobs.List exposing (Action(Polling))
import Jobs.Stats
import Types.List as Types
import Nav exposing (view, Active(Types, Systems, Jobs), Section(Stats, Launch, Add, List))
import Html.Attributes exposing (type', class, id)
import Bootstrap.Html exposing (..)
import Debug

init : (Model, Effects Action)
init =
  let 
    (systemsView, systemsViewAction) = SystemsList.init 
    (systemsAdd, systemsAddAction ) = Add.init 
    (systemsLaunch, _) = Launch.init 
    (jobsList, jobsListAction) = Jobs.List.init
    (jobsStat, jobsStatAction) = Jobs.Stats.init
    (typesModel, typesAction)  = Types.init 
    effects = [ Effects.map SystemsView systemsViewAction
              , Effects.map TypesAction typesAction
              , Effects.map JobsList jobsListAction
              , Effects.map JobsStats jobsStatAction
              , Effects.map SystemsAdd systemsAddAction]
  in
    (Model systemsView systemsAdd systemsLaunch jobsList jobsStat typesModel Nav.init , Effects.batch effects) 

type alias Model = 
  { systemsView : SystemsList.Model
  , systemsAdd : Add.Model
  , systemsLaunch : Launch.Model
  , jobsList : Jobs.List.Model
  , jobsStats : Jobs.Stats.Model
  , types : Types.Model, nav : Nav.Model }


type Action = 
     SystemsView SystemsList.Action
   | SystemsAdd Add.Action
   | SystemsLaunch Launch.Action
   | JobsList Jobs.List.Action
   | JobsStats Jobs.Stats.Action
   | TypesAction Types.Action
   | NavAction Nav.Action

setupJob : Launch.Action -> Model -> (Model, Effects Action)
setupJob action ({ systemsView, systemsLaunch } as model) =
  let
    (_, systems) = systemsView.systems
    table = systemsView.table
    selected = List.filter (\(id,s) -> Set.member id table.selected) systems
    selectedTable = { table | rows = selected, selected = Set.empty, id = "launchListing" }
    (newLaunch, effect) = Launch.update action { systemsLaunch |  table =  selectedTable }
    newNav = Nav.update (Nav.Goto Systems Launch) model.nav
  in
    if List.isEmpty selected then
      ({ model | systemsView = { systemsView | error = NoSystemSelected}} , Effects.none)
    else
      ({ model | systemsLaunch = newLaunch, nav = newNav, systemsView = { systemsView | error = NoError}}, Effects.map SystemsLaunch effect)

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
update action ({nav, systemsView, systemsAdd, jobsList, jobsStats} as model) =
  case action of 
    SystemsView systemsAction -> 
      let 
        (newSystems, effect ) = SystemsList.update systemsAction systemsView
      in
        ({ model | systemsView = newSystems }, Effects.map SystemsView effect)

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
         SystemsList.view (Signal.forwardTo address SystemsView) model.systemsView 

       Launch ->
         Launch.view (Signal.forwardTo address SystemsLaunch) model.systemsLaunch

       Add ->
         Add.view (Signal.forwardTo address SystemsAdd) model.systemsAdd

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
  div [ class "container-fluid" ] 
    (List.append (Nav.view (Signal.forwardTo address NavAction) model.nav) (activeView address model))

