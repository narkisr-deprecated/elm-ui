import Html.App as Html -- was StartA
import Task
import Common.Redirect as Redirect exposing (redirectMsgs)
import Common.NewTab as NewTab exposing (newtabMsgs)
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
import Jobs.List exposing (Msg(Polling))
import Jobs.Stats as Stats exposing (Msg(PollMetrics))
import Jobs.Core as Jobs

main =  
  Html.program
    { init = init
    , update = update
    , view = view
    , subscriptions = \_ -> Sub.none
    }

-- app =
--   StartApp.start
--     { init = init
--     , update = update
--     , view = view
--     , inputs = [
--         parsingInput (Search.Result True) parsingOk , 
--         parsingInput (Search.Result False) parsingErr,
--         menuClick menuPort,
--         editorValue editorInPort,
--         jobsListPolling,
--         jobsStatsPolling,
--         routerSignal
--       ]
--     }


toResource msg = 
  case msg of 
    Redirect.To s -> 
      s

    _ -> 
      ""


toQuery : (Search.Msg -> String)
toQuery msg =
   case msg of
     Search.Parse query -> 
       query

     _ -> ""

-- port parserPort : Signal String
-- port parserPort =
--    searchMsgs.signal
--      |> filter (\s -> s /= Search.NoOp) Search.NoOp
--      |> map toQuery
--
port parsingOk : Signal Search.ParseResult

parsingInput msg p =
  Signal.map (\r -> App.SystemsMsg (SystemsCore.SystemsListing (Systems.List.Searching (msg r)))) p

port parsingErr : Signal Search.ParseResult

jobsListPolling : Signal App.Msg
jobsListPolling =
  Signal.map (\_ -> App.JobsMsg (Jobs.JobsListing Polling)) (Time.every (1 * second))

jobsStatsPolling : Signal App.Msg
jobsStatsPolling =
  let
    (model, _)= Stats.init
  in
    Signal.map (\t -> App.JobsMsg (Jobs.JobsStats (PollMetrics t))) (Time.every (model.interval * second))

port menuPort : Signal (String, String, String)

intoMsgs (dest, job, target) = 
  case dest of
    "Systems" ->
       App.SystemsMsg (SystemsCore.SystemsLaunch (SystemsLaunch.SetupJob job))

    "Templates" ->
       App.TemplatesMsg (TemplatesCore.SetupJob (job, target))

    "Types" ->
       App.TypesMsg (TypesCore.MenuClick (job, target))

    "Users" ->
       App.UsersMsg (UsersCore.MenuClick (job, target))

    _ -> 
       App.NoOp

menuClick p =
 Signal.map intoMsgs p


router : Router Route
router =
  Hop.new Routing.config


routerSignal : App.Msg
routerSignal =
  Signal.map App.ApplyRoute router.signal

port routeRunTask : Task () ()
port routeRunTask =
  router.run
