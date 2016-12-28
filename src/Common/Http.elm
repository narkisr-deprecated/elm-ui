module Common.Http exposing (..)

import Http exposing (expectJson, header)
import Json.Decode as Json exposing (..)


httpJson : String -> Http.Body -> Decoder value -> String -> (Result Http.Error value -> msg) -> Cmd msg
httpJson method body decoder url msg =
    let
        payload =
            { method = method
            , headers =
                [ header "Content-Type" "application/json;charset=UTF-8"
                , header "Accept" "application/json, text/plain, */*"
                ]
            , url = url
            , body = body
            , expect = expectJson decoder
            , timeout = Nothing
            , withCredentials = False
            }
    in
        Http.send msg (Http.request payload)


delete =
    httpJson "DELETE" Http.emptyBody


getJson =
    httpJson "GET" Http.emptyBody


postJson =
    httpJson "POST"


putJson =
    httpJson "PUT"


apply : Json.Decoder (a -> b) -> Json.Decoder a -> Json.Decoder b
apply func value =
    Json.map2 (<|) func value
