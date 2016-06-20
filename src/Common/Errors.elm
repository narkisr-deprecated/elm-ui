module Common.Errors exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Effects exposing (Effects, batch)
import Common.Redirect exposing (redirect)
import Http exposing (Error(BadResponse))
import Systems.Add.Common exposing (..)
import Dict exposing (Dict)
import Maybe exposing (withDefault)
import Common.Components exposing (panelContents)
import Json.Decode as Json exposing (..)
import Dict exposing (Dict)

type Error = 
  Nested (Dict String String)
    | DeepNestedList (Dict String (List (Dict String (Dict String String))))
    | NestedList (Dict String (List (Dict String String)))
    | Value String

type alias Errors = 
  {  type' : String
  ,  keyValues : Maybe (Dict String Error)
  ,  message : Maybe String
  } 

type alias Model = 
  {errors : Errors}

init : Model
init =
  Model (Errors "" Nothing Nothing)

type Action = 
  NoOp

mapValues : (comparable -> a -> b) -> Dict comparable a -> List b
mapValues f d =
  Dict.values (Dict.map f d)

nestedSection : String -> Dict String String -> Html
nestedSection key errors =
  div [] [
    text key 
  , ul [] (mapValues (\k v -> li [][text ( k ++ ": " ++ v)]) errors)
  ]

deepNestedList : String -> List (Dict String (Dict String String)) -> Html
deepNestedList prop nested =
  div [] 
   (List.concat
     (List.map 
       (\parent -> mapValues (\key errors -> (nestedSection (prop ++ "." ++ key) errors)) parent) nested))

nestedList : String -> (List (Dict String String)) -> Html
nestedList prop nested =
  div [] (List.map (\section -> (nestedSection prop section))  nested)
     
toText : String -> Error -> Html
toText key error =
  case error of 
    Nested errors ->
       nestedSection key errors

    DeepNestedList errors ->
      div [] 
        (mapValues (\prop nested -> deepNestedList (key++ "." ++ prop) nested) errors)

    NestedList errors ->
      div [] 
        (mapValues (\prop nested -> nestedList (key++ "." ++ prop) nested) errors)

    Value error -> 
      text (key ++ ": " ++ error)

errorsList : Errors -> Bool
errorsList errors =
   not (errors.keyValues == Nothing)

hasErrors {errors} = 
   errorsList errors || (errors.message /= Nothing)

errorsText : Errors -> Html
errorsText errors =
 if errorsList errors then 
    ul [style [("list-style-type", "none")]]
      (Dict.values (Dict.map (\k v -> li [] [toText k v] ) (withDefault Dict.empty errors.keyValues)))
 else
    div [] [ 
      text (withDefault "" errors.message)
    ]

view : Signal.Address Action -> Model -> Html
view address {errors} =
   div [class "panel-body"] [
     h4 [] [
       text "The following errors found:"
     ]
   , errorsText errors
   ] 
    

errorsDecoder : Decoder Errors
errorsDecoder  =
  let
    options = [ map Value string 
              , map Nested (dict string) 
              , map DeepNestedList (dict (list (dict (dict string))))
              , map NestedList (dict (list (dict string)))
              ]
  in
    (object3 Errors
      (at ["object", "type"] string)
      (maybe (at ["object", "errors"] (dict (oneOf options))))
      (maybe ("message" := string))
      )

messageDecoder : Decoder Errors
messageDecoder  =
    (object1 (Errors "" Nothing)
      (maybe ("message" := string)))

decodeError : Http.Value -> Errors
decodeError error = 
  let 
    emptyErrors = (Errors "" Nothing Nothing)
  in 
  case error of
    Http.Text value -> 
      case (decodeString errorsDecoder value) of
        Result.Ok errors -> 
          errors

        Result.Err e -> 
          case Debug.log (toString e) (decodeString messageDecoder value) of
            Result.Ok errors -> 
               errors

            Result.Err e -> 
              Debug.log e emptyErrors

    _ -> emptyErrors
 
identitySuccess : m -> r -> (m, Effects a)
identitySuccess model res =
  (model, Effects.none)

identityFail : m -> Errors -> (m, Effects a)
identityFail model res =
  Debug.log ("request failed " ++ (toString res)) (model, Effects.none)

handler : Result Http.Error r -> m -> (r -> (m, Effects a)) -> (Errors -> (m, Effects a)) -> a -> (m, Effects a)
handler result model success fail noop = 
  case result of

   Result.Ok res -> 
     success res

   Result.Err e -> 
     case e of 
       BadResponse 401 m _ ->
         Debug.log (toString e) (model , (redirect noop "login"))

       BadResponse 400 m resp ->
         (fail (decodeError resp))

       _ -> Debug.log (toString e) (model , Effects.none)

successHandler : Result Http.Error r -> m -> (r -> (m, Effects a)) -> a -> (m, Effects a)
successHandler result model success noop = 
  handler result model success (identityFail model) noop
  
failHandler : Result Http.Error r -> m -> (Errors -> (m, Effects a)) -> a -> (m, Effects a)
failHandler result model fail noop = 
  handler result model (identitySuccess model) fail noop

errorsHandler : Result Http.Error r -> {m | saveErrors : {errors : Errors }} -> a -> ({m | saveErrors : {errors : Errors } }, Effects a)
errorsHandler result model noop = 
  handler result model (identitySuccess model) (setErrors model) noop

errorsSuccessHandler result model success noop = 
  handler result model success (setErrors model) noop

setErrors : {r | saveErrors : {errors : Errors } } -> Errors -> ({r | saveErrors : {errors : Errors } }, Effects a)
setErrors ({saveErrors} as model) es =
  let
    newErrors = {saveErrors | errors = es}  
  in 
    ({model | saveErrors = newErrors}, Effects.none)


