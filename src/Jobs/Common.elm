module Jobs.Common exposing (..)

import Html exposing (..)
import Json.Decode as Json exposing (..)
import Http exposing (Error(BadStatus))


type alias JobResponse =
    { message : String, id : String, job : String }


jobResponse : Decoder JobResponse
jobResponse =
    map3 JobResponse
        (field "message" Json.string)
        (field "id" Json.string)
        (field "job" Json.string)


runJob : String -> String -> (Result Http.Error JobResponse -> a) -> Cmd a
runJob id job msg =
    Http.send msg
        (Http.post ("/jobs/" ++ job ++ "/" ++ id) Http.emptyBody jobResponse)
