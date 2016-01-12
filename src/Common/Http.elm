module Common.Http where

import Task exposing (Task)
import Http exposing (Error(BadResponse))
import Json.Decode exposing (..)

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


getJson = httpJson "GET" Http.empty

postJson = httpJson "POST"
