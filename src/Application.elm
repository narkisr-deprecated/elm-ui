module Application exposing (..)


import Html exposing (..)
import Html.App as App
import Platform.Cmd exposing (batch, map)

import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src)
import Systems.Core as Systems 
import Stacks.Core as Stacks 
import Jobs.Core as Jobs
import Common.Utils exposing (none)
import Common.Components exposing (asList)
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


init : (Model, Cmd Msg)
init =
  let 
    (jobs, jobsMsg) = Jobs.init
    (types, typesMsg) = Types.init
    (users, usersMsg) = Users.init
    (templates, templatesMsg) = Templates.init
    (nav, navMsg) = Nav.init
    (systems, systemsMsg) = Systems.init
    (stacks, stacksMsg) = Stacks.init
    msgs = [ Cmd.map TemplatesMsg templatesMsg
              , Cmd.map TypesMsg typesMsg
              , Cmd.map UsersMsg usersMsg
              , Cmd.map SystemsMsg systemsMsg
              , Cmd.map StacksMsg stacksMsg
              , Cmd.map NavMsg navMsg
              , Cmd.map JobsMsg jobsMsg
              ]
  in
    (Model systems stacks jobs types templates users nav defaultRoute newLocation, Cmd.batch msgs) 

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

route : Msg ->  Model -> (Model , Cmd Msg)
route msg ({route, types, users, jobs, systems, templates, stacks} as model) =
  case msg of 
    JobsMsg msg -> 
      if Jobs.isPolling msg &&  BaseRoute.notJobs route then
        none model 
      else 
        let
          (newJob, msgs) = Jobs.update msg jobs
        in
          ({model | jobs = newJob}, Cmd.map JobsMsg msgs) 

    TypesMsg msg -> 
      let 
       (newTypes, msgs) = navigate (Types.update msg types) TypesMsg
      in
       ({ model | types = newTypes}, msgs) 


    UsersMsg msg -> 
      let 
       (newUsers, msgs) = navigate (Users.update msg users) UsersMsg
      in
       ({ model | users = newUsers}, msgs) 


    StacksMsg msg -> 
      let 
       (newStacks, msgs) = Stacks.update msg stacks
      in
       ({ model | stacks = newStacks}, Cmd.map StacksMsg msgs) 

    TemplatesMsg msg -> 
      let 
        (newTemplates, msgs) = navigate (Templates.update msg templates) TemplatesMsg
      in
        ({ model | templates = newTemplates} , msgs)

    SystemsMsg msg -> 
      let 
        (newSystems, msgs) = navigate (Systems.update msg systems) SystemsMsg
      in
        ({ model | systems = newSystems}, msgs)

    ApplyRoute (route, location) ->
      case route of 
        NotFoundRoute -> 
            (model,  Cmd.map HopMsg (modifyUrl "systems/list"))

        _ -> 
            none { model | route = route, location = location }

    HopMsg () ->
      none model

    _ -> 
        none model

navigate ({navChange} as model, msgs) msg = 
  case navChange of 
    Just path -> 
      let 
       withNavChange = [
           Cmd.map msg msgs
         , Cmd.map HopMsg (modifyUrl path)
        ]
      in
       ({model | navChange = Nothing }, Cmd.batch withNavChange)

    Nothing -> 
      (model, Cmd.map msg msgs)


update : Msg ->  Model -> (Model , Cmd Msg)
update msg model = 
   route msg model

activeView : Model -> Html Msg
activeView ({jobs, route, systems, types, templates, stacks, users} as model) =
    case route of
      SystemsRoute nested -> 
        App.map SystemsMsg (Systems.view systems nested)
      
      TypesRoute nested -> 
        App.map TypesMsg (Types.view types nested)

      TemplatesRoute nested -> 
        App.map TemplatesMsg (Templates.view templates nested)
      
      JobsRoute nested -> 
        App.map JobsMsg (Jobs.view jobs nested)

      UsersRoute nested -> 
        App.map UsersMsg (Users.view users nested)
      
      _ ->
        App.map SystemsMsg (Systems.view systems List)

view : Model -> Html Msg
view ({nav} as model) = 
  div [class "wrapper"] [
     div [class "content-wrapper"] [
       section [class "content"] (asList (activeView model))
     , App.map NavMsg (Nav.sideView nav)
     , App.map NavMsg (Nav.headerView nav)
     ]
  ]

