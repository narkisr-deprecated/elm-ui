module Systems.Add.Validations where

import String 
import Regex exposing (regex, HowMany(All), find)
import Dict

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


