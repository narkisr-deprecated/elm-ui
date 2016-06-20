module Jobs.List exposing (..)

-- view
import Html exposing (..)
import Html.Attributes as Attr exposing (type', class, id, attribute, href, style)
import Bootstrap.Html exposing (..)
import Common.Http exposing (getJson)

-- remoting
import Json.Decode as Json exposing (..)
import Task
import Effects exposing (Effects, map, batch)
import Http exposing (Error(BadResponse))
import Debug
import Date
import Date.Format exposing (format)

-- model 
import Dict exposing (Dict)
import Common.Errors exposing (successHandler)
import Common.NewTab exposing (newtab)
import Table exposing (view,Action(Select))
import Pager exposing (..)
import String

-- Model
type alias RunningJob = 
  { env : String
  , id : String
  , jid : String
  , status : String
  , tid : String
  , tid_link : String
  , type' : String} 

type alias DoneJob = 
  { start : Float 
  , end : Float
  , env : String
  , hostname : String
  , identity : String
  , queue : String
  , status : String
  , tid : String
  , tid_link : String
  }


type alias Model = 
  { running : Table.Model RunningJob
  , done : Table.Model DoneJob
  , pager : Pager.Model
  } 

type Action = 
  SetRunning(Result Http.Error (List RunningJob))
  | SetDone(Result Http.Error (Int ,(List DoneJob)))
  | Polling
  | LoadRunning (Table.Action RunningJob)
  | LoadDone (Table.Action DoneJob)
  | NoOp
  | GotoPage Pager.Action

init : (Model , Effects Action)
init =
  let
    running = Table.init "runningJobs" False ["#","Queue", "Status"] runningRow "Running Jobs"
    done = Table.init "doneJobs" False ["#", "Start", "Host",  "Queue", "Runtime (min:sec)", "Status"] doneRow "Done Jobs"
  in
  (Model running done Pager.init, batch [getRunning, getDone 1 10])

-- Update

setRunningJobs : Model -> List RunningJob -> (Model , Effects Action)
setRunningJobs ({running} as model) res =
  let 
    jobsList = List.map (\({tid} as r) -> (tid, r)) res
  in  
    ({model | running = (Table.update (Table.UpdateRows jobsList) running)} , Effects.none)

setDoneJobs : Model -> (Int, List DoneJob) -> (Model , Effects Action)
setDoneJobs ({done, pager} as model) (total, doneJobs) =
  let 
    newPager = (Pager.update (Pager.UpdateTotal (Basics.toFloat total)) pager)
    jobsList = List.map (\({tid} as r) -> (tid, r)) doneJobs
    newDone = (Table.update (Table.UpdateRows jobsList) done)
  in  
   ({model | done = newDone, pager = newPager} , Effects.none)
  
update : Action ->  Model-> (Model , Effects Action)
update action ({running, done, pager} as model) =
  case action of 
    Polling ->
      (model , batch [getRunning, getDone pager.page 10])

    SetRunning result -> 
      successHandler result model (setRunningJobs model) NoOp

    SetDone result ->
      successHandler result model (setDoneJobs model) NoOp

    GotoPage pageAction -> 
      case pageAction of
        Pager.NextPage page -> 
          let
            newPager = (Pager.update pageAction model.pager)
          in
            ({model | pager = newPager}, getDone page 10)
        _  ->
          (model , Effects.none)
    LoadDone (Select tid) ->
       let
         emptyRow = DoneJob 0 0 "" "" "" "" "" "" ""
         (_, job) = Maybe.withDefault (tid, emptyRow) (List.head (List.filter (\(_,job) -> job.tid == tid ) done.rows))
       in
         (model, (newtab NoOp job.tid_link))

    LoadRunning (Select tid) ->
       let
         emptyRow = RunningJob "" "" "" "" "" "" ""
         (_, job) = Maybe.withDefault (tid, emptyRow) (List.head (List.filter (\(_,job) -> job.tid == tid ) running.rows))
       in
         (model, (newtab NoOp job.tid_link))

    _ -> 
      (model , Effects.none)

-- View

runningRow : String -> RunningJob -> List Html
runningRow tableId {type', status,id } = 
 [
   td [] [ text id ]
 , td [] [ text type']
 , td []  [
      div  [class "progress progress-xs progress-striped active"] [
         div  [class "progress-bar progress-bar-primary", Attr.id status , style [("width", "0%")]] [
           
         ]
      ]
   
   ]
 ]

doneRow : String -> DoneJob -> List Html
doneRow tableid {hostname, start, end, queue, identity, status} = 
  let 
   min = (toString ((round (end - start)) // (1000 * 60)))
   sec = (toString (((round ((end - start) / 1000))) % 60))
   pad = (\str ->  if String.length str == 1 then ("0" ++ str) else str)
  in
    [
     td [] [ text identity]
    , td [] [ text (format "%d/%m/%Y %H:%M" (Date.fromTime start))]
    , td [] [ text hostname ]
    , td [] [ text queue]
    , td [] [ text ((pad min) ++ ":" ++ (pad sec)) ]
    , td [] [ text status ]
    ]


accordionPanel : Bool -> String -> Html -> Html
accordionPanel active ident body = 
  let
     enabled = if active then " in" else ""
  in
    div [class "panel panel-default"] [ 
      div [class "panel panel-heading", id ("heading" ++ ident), attribute "role" "tab"] [ 
        h4 [class "panel-title"] [
          a [ attribute "role" "button"
            , attribute "data-toggle" "collapse"
            , attribute "data-parent" "#accordion"
            , href ("#collapse" ++ ident)
            , attribute "aria-expanded" (toString active)
            , attribute "aria-controls" ("collapse" ++ ident)
            ] [text ident]
          ]
         ]  
         , div [ id ("collapse" ++ ident )
               , class ("panel-collapse collapse" ++ enabled)
               , attribute "role" "tabpanel"
               , attribute "aria-labelledby" ("heading" ++ ident)] 
               [div [class "panel-body"] [ body ]]
      ]


view : Signal.Address Action -> Model -> List Html
view address ({running, done, pager} as model) =
  [div [class "panel-group", id "accordion", attribute "role" "tablist"] 
     [ accordionPanel (not (List.isEmpty running.rows)) "Running" 
         (panelDefault_ (Table.view (Signal.forwardTo address LoadRunning) running))
     , accordionPanel (not (List.isEmpty done.rows)) "Done" 
         (div [] 
           [ row_ [
               div [class "col-md-12"][
                 (panelDefault_ (Table.view (Signal.forwardTo address LoadDone) done))
               ]
             ]
           , row_ [(Pager.view (Signal.forwardTo address GotoPage) pager)]
           ]
         ) 
     ]
  ]

-- Decoding

runningJob : Decoder RunningJob
runningJob =
  object7 RunningJob
    ("env" := string) 
    ("id" := string) 
    ("jid" := string) 
    ("status" := oneOf [string, null ""]) 
    ("tid" := string) 
    ("tid-link" := oneOf [string, null ""])
    ("type" := string)


runningList : Decoder (List RunningJob)
runningList = 
  at ["jobs"] (list runningJob)

apply : Json.Decoder (a -> b) -> Json.Decoder a -> Json.Decoder b
apply func value =
    Json.object2 (<|) func value

doneJob : Decoder DoneJob
doneJob =
  Json.map DoneJob
    ("start" := float) 
   `apply`  ("end" := float) 
   `apply`  ("env" := string) 
   `apply`  ("hostname" := string) 
   `apply`  ("identity" := string) 
   `apply`  ("queue" := string)
   `apply`  ("status" := string)
   `apply`  ("tid" := string) 
   `apply`  ("tid-link" := oneOf [string, null ""])

doneList : Decoder (Int, (List DoneJob))
doneList = 
  Json.object2 (,)
    ("total" := int)
    ("jobs" := (list doneJob))


-- Effects

getRunning : Effects Action
getRunning = 
  getJson runningList "/jobs/running" 
    |> Task.toResult
    |> Task.map SetRunning
    |> Effects.task

getDone : Int -> Int -> Effects Action
getDone page offset= 
  getJson doneList ("/jobs/done?offset=" ++ (toString offset) ++ "&page=" ++ (toString page))
    |> Task.toResult
    |> Task.map SetDone
    |> Effects.task

    
   

