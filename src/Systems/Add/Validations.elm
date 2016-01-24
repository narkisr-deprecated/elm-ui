module Systems.Add.Validations where

import String 
import Regex exposing (regex, HowMany(All), find)
import Dict exposing (Dict)
import Maybe exposing (withDefault)

type Error = 
  None
  | Invalid String

notEmpty : String -> Error
notEmpty value =
  if String.isEmpty value then
    Invalid "cannot be empty"
  else 
    None

hasItems : List a -> Error
hasItems value =
  if List.isEmpty value then
    Invalid "cannot be empty"
  else 
    None

notContained : (String, List String) -> Error
notContained (value, list) =
  case (notEmpty value) of 
    Invalid msg -> 
       Invalid msg
    None ->
      if List.member value list then
        Invalid "cannot add twice"
      else 
        None

validIp : String -> Error
validIp value = 
  if not (String.isEmpty value) && List.length (find All (regex "\\d+\\.\\d+\\.\\d+\\.\\d+$") value) /= 1 then
    Invalid "non legal ip address"
  else 
    None

validId : Int -> String -> Bool -> String -> Error
validId length prefix allowEmpty value =
  if (String.isEmpty value) && allowEmpty then
    None
  else if not (String.contains prefix value) then
    Invalid ("Id should start with " ++ prefix) 
   else if String.length value /= length  then
     Invalid ("Id should have " ++ (toString length) ++ " characthers")
  else
    None

vpair step validations = 
  (toString step, Dict.fromList validations)

notAny:  Dict String (List Error) -> Bool
notAny errors =
  List.isEmpty (List.filter (\e -> not (List.isEmpty e)) (Dict.values errors))

validateAll : List (Dict String (Dict comparable (a -> a))) -> b -> a -> a
validateAll validations step model =
  let
    stepValues = (List.map (\vs -> withDefault Dict.empty (Dict.get (toString step) vs)) validations)
  in
    List.foldl (\v m -> (v m)) model (List.concat (List.map Dict.values stepValues))

validate : s -> String -> Dict String (Dict String (m -> m)) -> (m -> m)
validate step key validations =
  let
    stepValidations =  withDefault Dict.empty (Dict.get (toString step) validations)
  in
    withDefault identity (Dict.get key stepValidations)

validationOf key validations value ({errors} as model) =
   let
     res = List.filter (\error -> error /= None) (List.map (\validation -> (validation (value model))) validations)
     newErrors = Dict.update key (\_ -> Just res) errors
   in
     {model | errors = newErrors}
 
