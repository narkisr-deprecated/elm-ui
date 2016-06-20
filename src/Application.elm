module Application exposing (..)

import Html exposing (..)
import Effects exposing (Effects, Never, batch, map)

import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src)
import Systems.Core as Systems 
import Stacks.Core as Stacks 
import Jobs.Core as Jobs
import Common.Utils exposing (none)
import Types.Core as Types
import Users.Core as Users
import Templates.Core as Templates
import Nav.Core as Nav

import Bootstrap.Html exposing (..)
import Debug

-- Hop
import Hop.Types exposing (Location, Query,newLocation)
import Hop.Navigate exposing (navigateTo, setQuery)

-- Routing
import Routing as BaseRoute exposing (config, Route(..), defaultRoute)
import Systems.Routing exposing (Route(List))


init : (Model, Effects Action)
init =
  let 
    (jobs, jobsAction) = Jobs.init
    (types, typesAction) = Types.init
    (users, usersAction) = Users.init
    (templates, templatesAction) = Templates.init
    (nav, navAction) = Nav.init
    (systems, systemsAction) = Systems.init
    (stacks, stacksAction) = Stacks.init
    effects = [ Effects.map TemplatesAction templatesAction
              , Effects.map TypesAction typesAction
              , Effects.map UsersAction usersAction
              , Effects.map SystemsAction systemsAction
              , Effects.map StacksAction stacksAction
              , Effects.map NavAction navAction
              , Effects.map JobsAction jobsAction
              ]
  in
    (Model systems stacks jobs types templates users nav defaultRoute newLocation, Effects.batch effects) 

type alias Model = 
  { 
    systems : Systems.Model
  , stacks : Stacks.Model
  , jobs : Jobs.Model
  , types : Types.Model
  , templates : Templates.Model
  , users : Users.Model
  , nav : Nav.Model
  , route : BaseRoute.Route
  , location : Location
  }

type Action = 
  ApplyRoute (BaseRoute.Route,Location)
    | HopAction ()
    | NavigateTo String
    | SystemsAction Systems.Action
    | NavAction Nav.Action
    | StacksAction Stacks.Action
    | JobsAction Jobs.Action
    | TypesAction Types.Action
    | TemplatesAction Templates.Action
    | UsersAction Users.Action
    | NoOp

route : Action ->  Model -> (Model , Effects Action)
route action ({route, types, users, jobs, systems, templates, stacks} as model) =
  case action of 
    JobsAction action -> 
      if Jobs.isPolling action &&  BaseRoute.notJobs route then
        none model 
      else 
        let
          (newJob, effects) = Jobs.update action jobs
        in
          ({model | jobs = newJob}, Effects.map JobsAction effects) 

    TypesAction action -> 
      let 
       (newTypes, effects) = navigate (Types.update action types) TypesAction
      in
       ({ model | types = newTypes}, effects) 


    UsersAction action -> 
      let 
       (newUsers, effects) = navigate (Users.update action users) UsersAction
      in
       ({ model | users = newUsers}, effects) 


    StacksAction action -> 
      let 
       (newStacks, effects) = Stacks.update action stacks
      in
       ({ model | stacks = newStacks}, Effects.map StacksAction effects) 

    TemplatesAction action -> 
      let 
        (newTemplates, effects) = navigate (Templates.update action templates) TemplatesAction
      in
        ({ model | templates = newTemplates} , effects)

    SystemsAction action -> 
      let 
        (newSystems, effects) = navigate (Systems.update action systems) SystemsAction
      in
        ({ model | systems = newSystems}, effects)

    ApplyRoute (route, location) ->
      case route of 
        NotFoundRoute -> 
            (model,  Effects.map HopAction (navigateTo config "systems/list"))

        _ -> 
            none { model | route = route, location = location }

    HopAction () ->
      none model

    _ -> 
        none model

navigate ({navChange} as model, effects) action = 
  case navChange of 
    Just path -> 
      let 
       withNavChange = [
           Effects.map action effects
         , Effects.map HopAction (navigateTo config path)
        ]
      in
       ({model | navChange = Nothing }, Effects.batch withNavChange)

    Nothing -> 
      (model, Effects.map action effects)


update : Action ->  Model -> (Model , Effects Action)
update action model = 
   route action model

activeView : Signal.Address Action -> Model -> List Html
activeView address ({jobs, route, systems, types, templates, stacks, users} as model) =
    case route of
      SystemsRoute nested -> 
        Systems.view (Signal.forwardTo address SystemsAction) systems nested
      
      TypesRoute nested -> 
        Types.view (Signal.forwardTo address TypesAction) types nested

      TemplatesRoute nested -> 
        Templates.view (Signal.forwardTo address TemplatesAction) templates nested
      
      JobsRoute nested -> 
        Jobs.view (Signal.forwardTo address JobsAction) jobs nested

      UsersRoute nested -> 
        Users.view (Signal.forwardTo address UsersAction) users nested
      
      _ ->
         Systems.view (Signal.forwardTo address SystemsAction) systems List

view : Signal.Address Action -> Model -> Html
view address ({nav} as model) = 
  div [class "wrapper"] 
    (List.append
       (List.append 
         (Nav.sideView (Signal.forwardTo address NavAction) nav) 
         (Nav.headerView (Signal.forwardTo address NavAction) nav))
       [div [class "content-wrapper"]
         [section [class "content"] (activeView address model)]])

