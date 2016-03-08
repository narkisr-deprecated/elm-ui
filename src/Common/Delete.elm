module Common.Delete where

import Effects exposing (Effects)
import Html exposing (..)
import Common.Components exposing (message)
import Json.Decode exposing (..)
import Common.Components exposing (dangerCallout, error)

deleteMessage : String -> String -> List Html
deleteMessage item name =
  message "Notice!" [
    text (item ++ " ")
  , strong [] [text name] 
  , text " will be deleted! "
  ]

deleteView address {name} type' cancel delete  =
   dangerCallout address (deleteMessage name type' ) (div [] []) cancel delete

view address ({errorMsg} as model) type' cancel delete done=
  if errorMsg /= "" then
    dangerCallout address (error errorMsg) (div [] []) cancel done
  else
    deleteView address model type' cancel delete


type alias DeleteResponse = 
  { message : String } 

deleteResponse : Decoder DeleteResponse
deleteResponse = 
  object1 DeleteResponse
    ("message" := string) 

refresh init action succeeded ((model, effect) as original)  =
  if succeeded then
    let 
      (_ , listEffects) = init
      effects = [effect , Effects.map action listEffects ]
    in
      (model ,Effects.batch effects)
  else 
    original

succeeded action deleted expected = 
  if action == (deleted (Result.Ok { message = expected } )) then
    True
  else
    False
