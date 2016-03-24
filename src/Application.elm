module Application where

import Html exposing (..)
import Effects exposing (Effects, Never, batch, map)

import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src)
import Systems.Core as Systems 
import Stacks.Core as Stacks 
import Jobs.List exposing (Action(Polling))
import Jobs.Stats
import Common.Utils exposing (none)
import Types.Core as Types
import Templates.Core as Templates
import Nav.Side as NavSide exposing (Active(Stacks, Types, Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Nav.Core as Nav exposing (goto)

import Bootstrap.Html exposing (..)
import Debug

init : (Model, Effects Action)
init =
  let 
    (jobsList, jobsListAction) = Jobs.List.init
    (jobsStat, jobsStatAction) = Jobs.Stats.init
    (types, typesAction) = Types.init
    (templates, templatesAction) = Templates.init
    (nav, navAction) = Nav.init
    (systems, systemsAction) = Systems.init
    (stacks, stacksAction) = Stacks.init
    effects = [ 
                Effects.map TemplatesAction templatesAction
              , Effects.map TypesAction typesAction
              , Effects.map SystemsAction systemsAction
              , Effects.map StacksAction stacksAction
              , Effects.map NavAction navAction
              , Effects.map JobsList jobsListAction
              , Effects.map JobsStats jobsStatAction
              ]
  in
    (Model systems stacks jobsList jobsStat types templates nav, Effects.batch effects) 

type alias Model = 
  { 
    systems : Systems.Model
  , stacks : Stacks.Model
  , jobsList : Jobs.List.Model
  , jobsStats : Jobs.Stats.Model
  , types : Types.Model
  , templates : Templates.Model
  , nav : Nav.Model
  }

type Action = 
  SystemsAction Systems.Action
    | NavAction Nav.Action
    | StacksAction Stacks.Action
    | JobsList Jobs.List.Action
    | JobsStats Jobs.Stats.Action
    | TypesAction Types.Action
    | TemplatesAction Templates.Action
    | NoOp

-- Navigation changes
jobListing : Model -> (Model , Effects Action)
jobListing model = 
  let
    (newJobs, effects) = Jobs.List.init
  in 
    ({model | jobsList = newJobs}, Effects.map JobsList effects)

navigate : Action -> (Model , Effects Action) -> (Model , Effects Action)
navigate action ({systems, templates, stacks, types} as model , effects) =
  case action of
    SystemsAction action -> 
      case systems.navChange  of
         Just (Jobs, List) -> 
           let
             (withJobs, effects) = (jobListing model)
           in
             goto Jobs List withJobs effects
 
         Just (Systems, section) -> 
            goto Systems section model effects

         Just (Templates, section) -> 
            let
               (hyp, system) = (Systems.addedSystem systems)
               add = (Templates.add hyp system)
               (newTemplates, effects) = Templates.update add model.templates 
            in
              goto Templates section {model | templates = newTemplates}  (Effects.map TemplatesAction effects)
         _ -> 
            (model, effects) 

    TemplatesAction action -> 
        case templates.navChange of
          Just (active, dest) -> 
            goto active dest model effects

          _ -> 
            (model, effects) 

    TypesAction action -> 
        case types.navChange of
          Just (active, dest) -> 
            goto active dest model effects

          _ -> 
            (model, effects) 

    _ -> 
      (model, effects)


route : Action ->  Model -> (Model , Effects Action)
route action ({nav, types, jobsList, jobsStats, systems, templates, stacks} as model) =
  case action of 
    JobsList jobAction -> 
      if jobAction == Polling && (Nav.activeOf nav) /= Jobs then
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

    TypesAction action -> 
      let 
       (newTypes, effects) = Types.update action types
      in
       ({ model | types = newTypes}, Effects.map TypesAction effects) 

    StacksAction action -> 
      let 
       (newStacks, effects) = Stacks.update action stacks
      in
       ({ model | stacks = newStacks}, Effects.map StacksAction effects) 

    TemplatesAction action -> 
      let 
        (newTemplates, effects) = Templates.update action templates
      in
        ({ model | templates = newTemplates} , Effects.map TemplatesAction effects)

    SystemsAction action -> 
      let 
        (newSystems, effects) = Systems.update action systems
      in
        ({ model | systems = newSystems}, Effects.map SystemsAction effects)

    NavAction action -> 
      let 
        (newNav, effects) = Nav.update action nav
      in
        ({ model | nav = newNav}, Effects.map NavAction effects)

    _ -> 
        none model


update : Action ->  Model -> (Model , Effects Action)
update action model = 
   navigate action (route action model)

activeView : Signal.Address Action -> Model -> List Html
activeView address ({jobsList, jobsStats, nav, systems, types, templates, stacks} as model) =
  let
    section = (Nav.section nav)
  in 
    case Nav.activeOf nav of
      Systems -> 
        Systems.view (Signal.forwardTo address SystemsAction) systems section

      Types -> 
        Types.view (Signal.forwardTo address TypesAction) types section

      Templates -> 
        Templates.view (Signal.forwardTo address TemplatesAction) templates section
      
      Jobs -> 
        case section of
          List ->
            Jobs.List.view (Signal.forwardTo address JobsList) jobsList

          Stats ->
            Jobs.Stats.view (Signal.forwardTo address JobsStats) jobsStats

          _ ->
            []

      Stacks -> 
        Stacks.view (Signal.forwardTo address StacksAction) stacks section

view : Signal.Address Action -> Model -> Html
view address ({nav} as model) = 
  div [class "wrapper"] 
    (List.append
       (List.append 
         (Nav.sideView (Signal.forwardTo address NavAction) nav) 
         (Nav.headerView (Signal.forwardTo address NavAction) nav))
       [div [class "content-wrapper"]
         [section [class "content"] (activeView address model)]])

