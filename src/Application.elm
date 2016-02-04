module Application where

import Html exposing (..)
import Effects exposing (Effects, Never, batch, map)

import Systems.Core as Systems 
import Jobs.List exposing (Action(Polling))
import Jobs.Stats
import Common.Utils exposing (none)
import Types.Core as Types
import Templates.Core as Templates
import Nav.Side as NavSide exposing (Active(Types, Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Nav.Header as NavHeader

import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src)
import Bootstrap.Html exposing (..)
import Debug

init : (Model, Effects Action)
init =
  let 
    (jobsList, jobsListAction) = Jobs.List.init
    (jobsStat, jobsStatAction) = Jobs.Stats.init
    (navHeaderModel, navHeaderAction) = NavHeader.init
    (types, typesAction) = Types.init
    (templates, templatesAction) = Templates.init
    (systems, systemsAction) = Systems.init
    effects = [ 
                Effects.map TemplatesAction templatesAction
              , Effects.map TypesAction typesAction
              , Effects.map SystemsAction systemsAction
              , Effects.map NavHeaderAction navHeaderAction
              , Effects.map JobsList jobsListAction
              , Effects.map JobsStats jobsStatAction
              ]
  in
    (Model systems jobsList jobsStat types templates NavSide.init navHeaderModel, Effects.batch effects) 

type alias Model = 
  { 
    systems : Systems.Model
  , jobsList : Jobs.List.Model
  , jobsStats : Jobs.Stats.Model
  , types : Types.Model
  , templates : Templates.Model
  , navSide : NavSide.Model 
  , navHeader : NavHeader.Model 
  }


type Action = 
  SystemsAction Systems.Action
    | JobsList Jobs.List.Action
    | JobsStats Jobs.Stats.Action
    | NavSideAction NavSide.Action
    | NavHeaderAction NavHeader.Action
    | TypesAction Types.Action
    | TemplatesAction Templates.Action
    | NoOp

-- Navigation changes
jobListing : Model -> (Model , Effects Action)
jobListing ({navSide} as model) = 
  let
    (newJobs, effects) = Jobs.List.init
  in 
    ({model | jobsList = newJobs}, Effects.map JobsList effects)

goto : Active -> Section -> Model -> Model
goto active section ({navSide} as model)  =
  {model | navSide = NavSide.update (NavSide.Goto active section) navSide}


update : Action ->  Model-> (Model , Effects Action)
update action ({navSide, types, jobsList, jobsStats, systems, templates} as model) =
  case action of 
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

    TypesAction action -> 
      let 
       (newTypes, effects) = Types.update action types
      in
       ({ model | types = newTypes}, Effects.map TypesAction effects) 

    TemplatesAction action -> 
      let 
         (newTemplates, effects) = Templates.update action templates
         newModel = { model | templates = newTemplates }
      in
        case newTemplates.navChange of
          Just (Templates, dest) -> 
            (goto Templates dest newModel, Effects.map TemplatesAction effects)

          _ -> 
            (newModel , Effects.map TemplatesAction effects) 

    SystemsAction action -> 
      let 
        (newSystems, effects) = Systems.update action systems
        newModel = { model | systems = newSystems}
        newEffects = Effects.map SystemsAction effects
      in
        case newSystems.navChange  of
          Just (Jobs, List) -> 
            let
             (withJobs, jobEffects) = (jobListing newModel)
            in
             (goto Jobs List withJobs, jobEffects)

          Just (Systems, section) -> 
             (goto Systems section newModel , newEffects)

          Just (Templates, section) -> 
            let
             (hyp, system) = (Systems.addedSystem newModel.systems)
             add = (Templates.add hyp system)
             (newTemplates, effects) = Templates.update add model.templates 
            in
             (goto Templates section {newModel | templates = newTemplates} , Effects.map TemplatesAction effects)

          _ -> 
            (newModel, newEffects)

    _ -> 
          none model

activeView : Signal.Address Action -> Model -> List Html
activeView address ({jobsList, jobsStats} as model) =
  case model.navSide.active of
    Systems -> 
      Systems.view (Signal.forwardTo address SystemsAction) model.systems model.navSide.section 

    Types -> 
      Types.view (Signal.forwardTo address TypesAction) model.types model.navSide.section

    Templates -> 
      Templates.view (Signal.forwardTo address TemplatesAction) model.templates model.navSide.section
    
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

