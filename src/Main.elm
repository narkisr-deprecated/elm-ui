import Effects exposing (Never)
import StartApp
import Task
import Signal exposing (map, filter)
import Common.Redirect as Redirect exposing (redirectActions)
import Common.NewTab as NewTab exposing (newtabActions)
import Common.Editor as Editor exposing (editorActions)
import Search exposing (searchActions)
import Application as App exposing (init, view, update) 
import Users.Core as UsersCore
import Json.Encode as E exposing (list, string)

-- Systems
import Systems.List
import Systems.Launch as SystemsLaunch
import Systems.Core as SystemsCore

-- Types
import Types.Core as TypesCore
import Types.Add as TypesAdd
import Types.Edit as TypesEdit

-- Routing
import Hop
import Hop.Types exposing (Router)
import Routing exposing (..)
import Task exposing (Task)

-- Templates
import Templates.Add as TemplatesAdd
import Templates.Core as TemplatesCore

-- Stacks
import Stacks.Add as StacksAdd
import Stacks.Core as StacksCore

-- Jobs 
import Time exposing (every, second)
import Jobs.List exposing (Action(Polling))
import Jobs.Stats as Stats exposing (Action(PollMetrics))
import Jobs.Core as Jobs

app =
  StartApp.start
    { init = init
    , update = update
    , view = view
    , inputs = [
        parsingInput (Search.Result True) parsingOk , 
        parsingInput (Search.Result False) parsingErr,
        menuClick menuPort,
        editorValue editorInPort,
        jobsListPolling,
        jobsStatsPolling,
        routerSignal
      ]
    }

main =
  app.html 


port tasks : Signal (Task.Task Never ())
port tasks =
  app.tasks


toResource action = 
  case action of 
    Redirect.To s -> 
      s

    _ -> 
      ""

port redirectPort : Signal String
port redirectPort =
   redirectActions.signal
     |> filter (\s -> s /= Redirect.NoOp) Redirect.NoOp
     |> map toResource

toUrl action = 
  case action of 
    NewTab.Open s -> 
      s

    _ -> 
      ""

port newtabPort : Signal String
port newtabPort =
   newtabActions.signal
     |> filter (\s -> s /= NewTab.NoOp) NewTab.NoOp
     |> map toUrl

editJson action = 
  case action of 
    Editor.Load v -> 
      v

    _ -> 
      ("", "")

port editorInPort : Signal (String, String)

editorValue p =
 Signal.map (\(target, json) ->
    case target of 
      "templates" -> 
         App.TemplatesAction (TemplatesCore.TemplatesAdd (TemplatesAdd.SetDefaults json))
      
      "typesAdd" ->   
         App.TypesAction (TypesCore.Adding (TypesAdd.SetClasses json))

      "typesEdit" ->   
         App.TypesAction (TypesCore.Editing (TypesEdit.AddAction (TypesAdd.SetClasses json)))

      _ -> 
        App.NoOp

    ) p


port editorOutPort : Signal (String, String)
port editorOutPort =
   editorActions.signal
      |> filter (\s -> s /= Editor.NoOp ) Editor.NoOp
      |> map editJson

toQuery : (Search.Action -> String)
toQuery action =
   case action of
     Search.Parse query -> 
       query

     _ -> ""

port parserPort : Signal String
port parserPort =
   searchActions.signal
     |> filter (\s -> s /= Search.NoOp) Search.NoOp
     |> map toQuery

port parsingOk : Signal Search.ParseResult

parsingInput action p =
  Signal.map (\r -> App.SystemsAction (SystemsCore.SystemsListing (Systems.List.Searching (action r)))) p

port parsingErr : Signal Search.ParseResult

jobsListPolling : Signal App.Action
jobsListPolling =
  Signal.map (\_ -> App.JobsAction (Jobs.JobsListing Polling)) (Time.every (1 * second))
 
jobsStatsPolling : Signal App.Action
jobsStatsPolling =
  let
    (model, _)= Stats.init
  in
    Signal.map (\t -> App.JobsAction (Jobs.JobsStats (PollMetrics t))) (Time.every (model.interval * second))
 
port menuPort : Signal (String, String, String)

intoActions (dest, job, target) = 
  case dest of
    "Systems" ->
       App.SystemsAction (SystemsCore.SystemsLaunch (SystemsLaunch.SetupJob job))

    "Templates" ->
       App.TemplatesAction (TemplatesCore.SetupJob (job, target))

    "Types" ->
       App.TypesAction (TypesCore.MenuClick (job, target))

    "Users" ->
       App.UsersAction (UsersCore.MenuClick (job, target))


    _ -> 
       App.NoOp

menuClick p =
 Signal.map intoActions p


router : Router Route
router =
  Hop.new Routing.config


routerSignal : Signal App.Action
routerSignal =
  Signal.map App.ApplyRoute router.signal

port routeRunTask : Task () ()
port routeRunTask =
  router.run
