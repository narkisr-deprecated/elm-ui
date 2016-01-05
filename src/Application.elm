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
import Types.List as TypesList
import Table as Table
import Nav.Side as NavSide exposing (Active(Types, Systems, Jobs), Section(Stats, Launch, Add, List, View))
import Nav.Header as NavHeader

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
    (typesModel, typesAction)  = TypesList.init 
    (navHeaderModel, navHeaderAction) = NavHeader.init
    effects = [ Effects.map SystemsListing systemsListAction
              , Effects.map TypesListing typesAction
              , Effects.map NavHeaderAction navHeaderAction
              , Effects.map JobsList jobsListAction
              , Effects.map JobsStats jobsStatAction
              , Effects.map SystemsAdd systemsAddAction]
  in
    (Model systemsList systemsAdd systemsView 
           systemsLaunch jobsList jobsStat typesModel
           NavSide.init navHeaderModel, Effects.batch effects) 

type alias Model = 
  { systemsList : SystemsList.Model
  , systemsAdd : Add.Model
  , systemsView : SystemsView.Model
  , systemsLaunch : Launch.Model
  , jobsList : Jobs.List.Model
  , jobsStats : Jobs.Stats.Model
  , typesList : TypesList.Model
  , navSide : NavSide.Model 
  , navHeader : NavHeader.Model 
  }


type Action = 
     SystemsListing SystemsList.Action
   | SystemsAdd Add.Action
   | SystemsView SystemsView.Action
   | SystemsLaunch Launch.Action
   | JobsList Jobs.List.Action
   | JobsStats Jobs.Stats.Action
   | NavSideAction NavSide.Action
   | NavHeaderAction NavHeader.Action
   | TypesListing TypesList.Action

setupJob : Launch.Action -> Model -> (Model, Effects Action)
setupJob action ({ systemsList, systemsLaunch } as model) =
  let
    (_, systems) = systemsList.systems
    table = systemsList.table
    selected = List.filter (\(id,s) -> Set.member id table.selected) systems
    selectedTable = { table | rows = selected, selected = Set.empty, id = "launchListing" }
    (newLaunch, effect) = Launch.update action { systemsLaunch |  table =  selectedTable }
    newNavSide = NavSide.update (NavSide.Goto Systems Launch) model.navSide
  in
    if List.isEmpty selected then
      ({ model | systemsList = { systemsList | error = NoSystemSelected}} , Effects.none)
    else
      ({ model | systemsLaunch = newLaunch, navSide = newNavSide, systemsList = { systemsList | error = NoError}}, Effects.map SystemsLaunch effect)

jobListing : Model -> (Model , Effects Action)
jobListing ({navSide} as model) = 
  let
    (newJobs, effects) = Jobs.List.init
    newNavSide = NavSide.update (NavSide.Goto Jobs List) navSide
  in 
    ({model | navSide = newNavSide , jobsList = newJobs}, Effects.map JobsList effects)

systemListing : Model -> (Model , Effects Action)
systemListing ({navSide} as model) = 
  ({model |  navSide = NavSide.update (NavSide.Goto Systems List) navSide}, Effects.none)

update : Action ->  Model-> (Model , Effects Action)
update action ({navSide, systemsList, typesList, systemsAdd, jobsList, jobsStats, systemsView} as model) =
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
           ({model | systemsView = newSystems,  navSide = NavSide.update (NavSide.Goto Systems View) navSide}, Effects.map SystemsView effects)        

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
      if jobAction == Polling && navSide.active /= Jobs then
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

    NavSideAction navAction -> 
      let 
        newNavSide = NavSide.update navAction model.navSide
        (newModel, effects) = init
      in
        ({ newModel | jobsStats = jobsStats, navSide = newNavSide }, effects)

    NavHeaderAction navAction -> 
      let 
        (newNavHeader, effects) = NavHeader.update navAction model.navHeader
      in
        ({ model | navHeader = newNavHeader}, Effects.map NavHeaderAction effects)


    TypesListing action -> 
      let 
        (newTypes, effect ) = TypesList.update action typesList
      in
        ({ model | typesList = newTypes }, Effects.map TypesListing effect)


activeView : Signal.Address Action -> Model -> List Html
activeView address ({jobsList, jobsStats} as model) =
  case model.navSide.active of
   Systems -> 
     case model.navSide.section of
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
     TypesList.view (Signal.forwardTo address TypesListing) model.typesList

   Jobs -> 
     case model.navSide.section of
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
       (List.append 
         (NavHeader.view (Signal.forwardTo address NavHeaderAction) model.navHeader) 
         (NavSide.view (Signal.forwardTo address NavSideAction) model.navSide))
       [div [class "content-wrapper"]
         [section [class "content"] (activeView address model)]])

