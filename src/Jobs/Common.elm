module Jobs.Common exposing (..)


import Html exposing (..)
import Json.Decode as Json exposing (..)
import Http exposing (Error(BadResponse))
import Basics.Extra exposing (never)
import Task

type alias JobResponse =
  { message : String , id : String , job : String }

jobResponse : Decoder JobResponse
jobResponse =
  object3 JobResponse
    ("message" := Json.string)
    ("id" := Json.string)
    ("job" := Json.string)

runJob : String -> String -> (Result Error JobResponse -> a) -> Cmd a
runJob id job msg =
  Http.post jobResponse ("/jobs/" ++  job ++ "/" ++ id) Http.empty
    |> Task.toResult
    |> Task.perform never msg

