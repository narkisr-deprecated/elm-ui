import Effects exposing (Never)
import StartApp
import Task
import Signal exposing (map, filter)
import Common.Redirect as Redirect exposing (redirectActions)
import Common.NewTab as NewTab exposing (newtabActions)
import Common.Editor as Editor exposing (editorActions)
import Search exposing (searchActions)
import Application exposing (init, view, update)
import Systems.List
import Systems.Launch as SystemsLaunch
import Systems.Core as SystemsCore
import Templates.Launch as TemplatesLaunch
import Templates.Core as TemplatesCore

import Templates.Add as TemplatesAdd
import Templates.Core as TemplatesCore

import Time exposing (every, second)
import Jobs.List exposing (Action(Polling))
import Jobs.Stats as Stats exposing (Action(PollMetrics))

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
        jobsStatsPolling
      ]
    }

main =
  app.html 


port tasks : Signal (Task.Task Never ())
port tasks =
  app.tasks

port redirectPort : Signal ()
port redirectPort =
   redirectActions.signal
     |> filter (\s -> s == Redirect.Prompt) Redirect.NoOp
     |> map (always ())

toUrl action = 
  case action of 
    NewTab.Open s -> 
      s
    _ -> ""

port newtabPort : Signal String
port newtabPort =
   newtabActions.signal
     |> filter (\s -> s /= NewTab.NoOp ) NewTab.NoOp
     |> map toUrl


toJson action = 
  case action of 
    Editor.Load s -> 
      s
    _ -> ""


port editorInPort : Signal String

editorValue p =
 Signal.map (\json -> Application.TemplatesAction (TemplatesCore.TemplatesAdd (TemplatesAdd.SetDefaults json))) p


port editorOutPort : Signal String
port editorOutPort =
   editorActions.signal
      |> filter (\s -> s /= Editor.NoOp ) Editor.NoOp
      |> map toJson


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
  Signal.map (\r -> Application.SystemsAction (SystemsCore.SystemsListing (Systems.List.Searching (action r)))) p

port parsingErr : Signal Search.ParseResult

jobsListPolling : Signal Application.Action
jobsListPolling =
  Signal.map (\_ -> Application.JobsList Polling) (Time.every (1 * second))
 
jobsStatsPolling : Signal Application.Action
jobsStatsPolling =
  let
    (model, _)= Stats.init
  in
  Signal.map (\t -> Application.JobsStats (PollMetrics t)) (Time.every (model.interval * second))
 
port menuPort : Signal (String, String)

intoActions (dest, job) = 
  case dest of
    "Systems" ->
       Application.SystemsAction (SystemsCore.SystemsLaunch (SystemsLaunch.SetupJob job))

    "Templates" ->
       Application.TemplatesAction (TemplatesCore.TemplatesLaunch (TemplatesLaunch.SetupJob job))

    _ -> 
       Application.NoOp

menuClick p =
 Signal.map intoActions p

