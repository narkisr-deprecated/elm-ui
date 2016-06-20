module Systems.Launch exposing (..)

import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Common.Errors exposing (successHandler)
import Html exposing (..)
import Html.Events exposing (onClick)
import Effects exposing (Effects, Never, batch, map)
import Task
import Html.Attributes exposing (class, id)
import Table exposing (view)
import Bootstrap.Html exposing (..)
import Debug
import Systems.Model.Common exposing (System)
import Jobs.Common exposing (runJob, JobResponse)
import Common.Components exposing (dangerCallout)

import Set exposing (Set)
-- Model 

type alias Model = 
  { 
    job : String
  , table : Table.Model System
  }

type Action = 
  SetupJob String
  | LoadPage (Table.Action System)
  | JobLaunched (Result Http.Error JobResponse)
  | Run
  | NoOp
  | Cancel

systemRow : String -> System -> List Html
systemRow id {env, owner, type', machine} = 
 [
   td [] [ text id ]
 , td [] [ text (.hostname machine) ]
 , td [] [ text type' ]
 , td [] [ text env]
 , td [] [ text owner]
 ]


init : (Model , Effects Action)
init =
  let
    table = Table.init "launchListing" False ["#","Hostname", "Type", "Env","Owner"] systemRow "Systems"
  in
    (Model "" table, Effects.none)


-- Update

update : Action ->  Model-> (Model , Effects Action)
update action ({job} as model) =
  case action  of
    JobLaunched result ->
      successHandler result model (\ res -> (model, Effects.none)) NoOp 

    SetupJob job ->
      ({ model | job = job }, Effects.none)

    LoadPage tableAction -> 
      let
        newTable = Table.update tableAction model.table
      in
       ({ model | table = newTable }, Effects.none)

    Run -> 
      let
        runAll = model.table.rows 
          |> (List.map (\(id,_) -> id)) 
          |> (List.map (\id -> runJob id job JobLaunched)) 
          |> Effects.batch
      in
        (model, runAll)

    Cancel -> 
     (model, Effects.none)

    _ -> 
      (model, Effects.none)


-- View

message : String -> List Html
message job =
  [
     h4 [] [ text "Notice!" ]
  ,  span [] [
         text "A "
       , strong [] [text job] 
       , text " operation "
       , text "will be performed on the following systems:"   
     ]
 ]

view : Signal.Address Action -> Model -> List Html
view address {table, job} =
 let 
   systemsTable = (panelDefault_ (Table.view (Signal.forwardTo address LoadPage) table))
 in
   dangerCallout address (message job) systemsTable  Cancel Run



-- Effects

