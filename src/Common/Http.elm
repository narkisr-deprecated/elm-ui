module Common.Http where

import Task exposing (Task)
import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)

httpJson : String -> Http.Body -> Decoder value -> String -> Task Http.Error value
httpJson verb body decoder url  =
  let request =
        { verb = verb 
        , headers = [
             ("Content-Type", "application/json;charset=UTF-8")
           , ("Accept", "application/json, text/plain, */*")
         ]
        , url = url
        , body = body
        }
  in
    Http.fromJson decoder (Http.send Http.defaultSettings request)


delete = httpJson "DELETE" Http.empty

getJson = httpJson "GET" Http.empty

postJson = httpJson "POST"

apply : Json.Decoder (a -> b) -> Json.Decoder a -> Json.Decoder b
apply func value =
    Json.object2 (<|) func value

type alias SaveResponse = 
  {
    message : String 
  , id : Int 
  } 

saveResponse : Decoder SaveResponse
saveResponse = 
  object2 SaveResponse
    ("message" := string) 
    ("id" := int)


