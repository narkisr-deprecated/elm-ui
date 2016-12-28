module Jobs.Common exposing (..)

import Html exposing (..)
import Json.Decode as Json exposing (..)
import Http exposing (Error(BadStatus))
import Task


type alias JobResponse =
    { message : String, id : String, job : String }


jobResponse : Decoder JobResponse
jobResponse =
    map3 JobResponse
        ("message" field Json.string)
        ("id" field Json.string)
        ("job" field Json.string)


runJob : String -> String -> (Result Error JobResponse -> a) -> Cmd a
runJob id job msg =
    Http.post jobResponse ("/jobs/" ++ job ++ "/" ++ id) Http.empty
        |> Task.toResult
        |> Task.perform msg
