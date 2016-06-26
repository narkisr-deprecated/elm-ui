module Systems.Launch exposing (..)

import Html.App as App
import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Common.Errors exposing (successHandler)
import Html exposing (..)
import Html.Events exposing (onClick)
import Platform.Cmd exposing (batch, map)
import Task
import Html.Attributes exposing (class, id)
import Table exposing (view)
import Bootstrap.Html exposing (..)
import Debug
import Systems.Model.Common exposing (System)
import Jobs.Common exposing (runJob, JobResponse)
import Common.Components exposing (dangerCallout)
import Common.Utils exposing (none)

import Set exposing (Set)
-- Model 

type alias Model = 
  { 
    job : String
  , table : Table.Model System
  }

type Msg = 
  SetupJob String
  | LoadPage (Table.Msg System)
  | JobLaunched (Result Http.Error JobResponse)
  | Run
  | NoOp
  | Cancel

systemRow : String -> System -> List (Html msg)
systemRow id {env, owner, type', machine} = 
 [
   td [] [ text id ]
 , td [] [ text (.hostname machine) ]
 , td [] [ text type' ]
 , td [] [ text env]
 , td [] [ text owner]
 ]


init : (Model , Cmd Msg)
init =
  let
    table = Table.init "launchListing" False ["#","Hostname", "Type", "Env","Owner"] systemRow "Systems"
  in
    none (Model "" table)


-- Update

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({job} as model) =
  case msg  of
    JobLaunched result ->
      successHandler result model (\ res -> none model) NoOp 

    SetupJob job ->
      none ({ model | job = job })

    LoadPage tableMsg -> 
      let
        newTable = Table.update tableMsg model.table
      in
       none { model | table = newTable } 

    Run -> 
      let
        runAll = model.table.rows 
          |> (List.map (\(id,_) -> id)) 
          |> (List.map (\id -> runJob id job JobLaunched)) 
          |> batch
      in
        (model, runAll)

    Cancel -> 
      none model

    _ -> 
     none model


-- View

message : String -> List (Html Msg)
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

view : Model -> Html Msg
view {table, job} =
 let 
   systemsTable = panelDefault_ [(App.map LoadPage (Table.view table))]
 in
   dangerCallout (message job) systemsTable  Cancel Run



-- Effects

