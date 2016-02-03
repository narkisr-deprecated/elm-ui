module Common.Redirect where

import Signal exposing (Signal)
import Effects exposing (Effects)
import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Debug
import Task
import Dict exposing (Dict)

-- SIGNALS 
type Action = NoOp | Prompt

redirectActions : Signal.Mailbox Action
redirectActions =
  Signal.mailbox NoOp

redirect : a -> Effects a
redirect noop = 
  (Signal.send redirectActions.address Prompt)
     |> Task.map (always noop)
     |> Effects.task 


type Error = 
  Nested (Dict String String)
    | DeepNestedList (Dict String (List (Dict String (Dict String String))))
    | NestedList (Dict String (List (Dict String String)))
    | Value String

type alias Errors = 
  {  type' : String
  ,  keyValues : Dict String Error
  } 

errorDecoder : Decoder Errors
errorDecoder  =
  let
    options = [ map Value string 
              , map Nested (dict string) 
              , map DeepNestedList (dict (list (dict (dict string))))
              , map NestedList (dict (list (dict string)))
              ]
  in
   (object2 Errors
      (at ["object", "type"] string)
      (at ["object", "errors"] 
        (dict (oneOf options))))

decodeError : Http.Value -> Errors
decodeError error = 
  case error of
    Http.Text value -> 
      case (decodeString errorDecoder value) of
        Result.Ok errors -> 
          errors

        Result.Err e -> 
          Debug.log e (Errors "" Dict.empty)

    _ -> Errors "" Dict.empty
  

identitySuccess : m -> r -> (m, Effects a)
identitySuccess model res =
  (model, Effects.none)

identityFail : m -> Errors -> (m, Effects a)
identityFail model res =
  Debug.log ("request failed" ++ (toString res)) (model, Effects.none)

resultHandler : Result Http.Error r -> m -> (r -> (m, Effects a)) -> (Errors -> (m, Effects a)) -> a -> (m, Effects a)
resultHandler result model success fail noop = 
  case result of

   Result.Ok res -> 
     success res

   Result.Err e -> 
     case e of 
       BadResponse 401 m _ ->
         Debug.log (toString e) (model , (redirect noop))

       BadResponse 400 m resp ->
         (fail (decodeError resp))

       _ -> Debug.log (toString e) (model , Effects.none)

successHandler : Result Http.Error r -> m -> (r -> (m, Effects a)) -> a -> (m, Effects a)
successHandler result model success noop = 
  resultHandler result model success (identityFail model) noop
  
failHandler : Result Http.Error r -> m -> (Errors -> (m, Effects a)) -> a -> (m, Effects a)
failHandler result model fail noop = 
  resultHandler result model (identitySuccess model) fail noop

errorsHandler : Result Http.Error r -> {m | saveErrors : {errors : Errors }} -> a -> ({m | saveErrors : {errors : Errors } }, Effects a)
errorsHandler result model noop = 
  resultHandler result model (identitySuccess model) (setErrors model) noop

setErrors : {r | saveErrors : {errors : Errors } } -> Errors -> ({r | saveErrors : {errors : Errors } }, Effects a)
setErrors ({saveErrors} as model) es =
  let
    newErrors = {saveErrors | errors = es}  
  in 
    ({model | saveErrors = newErrors}, Effects.none)


