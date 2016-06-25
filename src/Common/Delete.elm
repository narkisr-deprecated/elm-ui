module Common.Delete exposing (..)


import Html exposing (..)
import Common.Components exposing (message)
import Json.Decode exposing (..)
import Common.Components exposing (dangerCallout, error)
import Platform.Cmd as Cmd exposing (batch)

deleteMessage : String -> String -> List (Html msg)
deleteMessage item name =
  message "Notice!" [
    text (item ++ " ")
  , strong [] [text name] 
  , text " will be deleted! "
  ]

deleteView {name} type' cancel delete  =
   dangerCallout (deleteMessage name type' ) (div [] []) cancel delete

view ({errorMsg} as model) type' cancel delete done=
  if errorMsg /= "" then
    dangerCallout (error errorMsg) (div [] []) cancel done
  else
    deleteView model type' cancel delete


type alias DeleteResponse = 
  { message : String } 

deleteResponse : Decoder DeleteResponse
deleteResponse = 
  object1 DeleteResponse
    ("message" := string) 

refresh init msg succeeded ((model, effect) as original)  =
  if succeeded then
    let 
      (_ , listMsgs) = init
      msgs= [effect , Cmd.map msg listMsgs]
    in
      (model ,Cmd.batch msgs)
  else 
    original

succeeded msg deleted expected = 
  if msg == (deleted (Result.Ok { message = expected } )) then
    True
  else
    False
