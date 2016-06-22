module Application exposing (..)

import Html exposing (..)
import Platform.Cmd exposing (batch, map)

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
import Hop.Types exposing (Location, Query, newLocation)
import Navigation exposing (modifyUrl)

-- Routing
import Routing as BaseRoute exposing (config, Route(..), defaultRoute)
import Systems.Routing exposing (Route(List))


init : (Model, Effects Msg)
init =
  let 
    (jobs, jobsMsg) = Jobs.init
    (types, typesMsg) = Types.init
    (users, usersMsg) = Users.init
    (templates, templatesMsg) = Templates.init
    (nav, navMsg) = Nav.init
    (systems, systemsMsg) = Systems.init
    (stacks, stacksMsg) = Stacks.init
    effects = [ Effects.map TemplatesMsg templatesMsg
              , Effects.map TypesMsg typesMsg
              , Effects.map UsersMsg usersMsg
              , Effects.map SystemsMsg systemsMsg
              , Effects.map StacksMsg stacksMsg
              , Effects.map NavMsg navMsg
              , Effects.map JobsMsg jobsMsg
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

type Msg = 
  ApplyRoute (BaseRoute.Route,Location)
    | HopMsg ()
    | NavigateTo String
    | SystemsMsg Systems.Msg
    | NavMsg Nav.Msg
    | StacksMsg Stacks.Msg
    | JobsMsg Jobs.Msg
    | TypesMsg Types.Msg
    | TemplatesMsg Templates.Msg
    | UsersMsg Users.Msg
    | NoOp

route : Msg ->  Model -> (Model , Effects Msg)
route msg ({route, types, users, jobs, systems, templates, stacks} as model) =
  case msg of 
    JobsMsg msg -> 
      if Jobs.isPolling msg &&  BaseRoute.notJobs route then
        none model 
      else 
        let
          (newJob, effects) = Jobs.update msg jobs
        in
          ({model | jobs = newJob}, Effects.map JobsMsg effects) 

    TypesMsg msg -> 
      let 
       (newTypes, effects) = navigate (Types.update msg types) TypesMsg
      in
       ({ model | types = newTypes}, effects) 


    UsersMsg msg -> 
      let 
       (newUsers, effects) = navigate (Users.update msg users) UsersMsg
      in
       ({ model | users = newUsers}, effects) 


    StacksMsg msg -> 
      let 
       (newStacks, effects) = Stacks.update msg stacks
      in
       ({ model | stacks = newStacks}, Effects.map StacksMsg effects) 

    TemplatesMsg msg -> 
      let 
        (newTemplates, effects) = navigate (Templates.update msg templates) TemplatesMsg
      in
        ({ model | templates = newTemplates} , effects)

    SystemsMsg msg -> 
      let 
        (newSystems, effects) = navigate (Systems.update msg systems) SystemsMsg
      in
        ({ model | systems = newSystems}, effects)

    ApplyRoute (route, location) ->
      case route of 
        NotFoundRoute -> 
            (model,  Effects.map HopMsg (modifyUrl To config "systems/list"))

        _ -> 
            none { model | route = route, location = location }

    HopMsg () ->
      none model

    _ -> 
        none model

navigate ({navChange} as model, effects) msg = 
  case navChange of 
    Just path -> 
      let 
       withNavChange = [
           Effects.map msg effects
         , Effects.map HopMsg (modifyUrl config path)
        ]
      in
       ({model | navChange = Nothing }, Effects.batch withNavChange)

    Nothing -> 
      (model, Effects.map msg effects)


update : Msg ->  Model -> (Model , Effects Msg)
update msg model = 
   route msg model

activeView : Model -> List (Html Msg)
activeView ({jobs, route, systems, types, templates, stacks, users} as model) =
    case route of
      SystemsRoute nested -> 
        Systems.view (Signal.forwardTo SystemsMsg) systems nested
      
      TypesRoute nested -> 
        Types.view (Signal.forwardTo TypesMsg) types nested

      TemplatesRoute nested -> 
        Templates.view (Signal.forwardTo TemplatesMsg) templates nested
      
      JobsRoute nested -> 
        Jobs.view (Signal.forwardTo JobsMsg) jobs nested

      UsersRoute nested -> 
        Users.view (Signal.forwardTo UsersMsg) users nested
      
      _ ->
         Systems.view (Signal.forwardTo SystemsMsg) systems List

view : Model -> Html Msg
view ({nav} as model) = 
  div [class "wrapper"] 
    (List.append
       (List.append 
         (Nav.sideView (Signal.forwardTo NavMsg) nav) 
         (Nav.headerView (Signal.forwardTo NavMsg) nav))
       [div [class "content-wrapper"]
         [section [class "content"] (activeView model)]])

