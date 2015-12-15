module Systems.Launch where

import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Common.Redirect exposing (successHandler)
import Html exposing (..)
import Html.Events exposing (onClick)
import Effects exposing (Effects, Never, batch, map)
import Task
import Html.Attributes exposing (class, id)
import Table exposing (view)
import Bootstrap.Html exposing (..)
import Debug
import Systems.Model.Common exposing (System)
import Common.Redirect exposing (redirect)

import Set exposing (Set)
-- Model 

type alias Model = 
  { job : String, table : Table.Model System}

type Action = 
  SetupJob String
  | LoadPage (Table.Action System)
  | JobLaunched (Result Http.Error JobResponse)
  | Run String
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
update action model =
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

    Run job -> 
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

view : Signal.Address Action -> Model -> List Html
view address model =
  [ row_ 
    [div [class "col-md-offset-1 col-md-10"]
      [div [class "panel panel-default"] [ 
          div [class "panel-body"] 
             [span [] 
                [text "A "
                , strong [] [text model.job] 
                , text " operation "
                , text "will be performed on the following systems:"   
                ]
             ]
         ]
      ]
    ]
  , row_ [
      div [class "col-md-offset-1 col-md-10"] [
       panelDefault_ (Table.view (Signal.forwardTo address LoadPage) model.table)
      ]
    ]
  , row_ [
     div [class "btn-group col-md-offset-5 col-md-10"] [
           button 
            [class "btn btn-danger btn-sm col-md-1 col-md-offset-1", onClick address Cancel ] [text "Cancel"]
         , button [class "btn btn-primary btn-sm col-md-1", onClick address (Run model.job) ][text "Ok"]
     ]
    ]
  ]

-- Effects

type alias JobResponse = 
  { message : String , id : String , job : String } 

jobResponse : Decoder JobResponse
jobResponse = 
  object3 JobResponse
    ("message" := Json.string) 
    ("id" := Json.string)
    ("job" := Json.string)

runJob : String -> String -> (Result Error JobResponse -> a) -> Effects a
runJob id job action =
  Http.post jobResponse ("/jobs/" ++  job ++ "/" ++ id) Http.empty
    |> Task.toResult
    |> Task.map action
    |> Effects.task
