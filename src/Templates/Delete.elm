module Templates.Delete where

import Effects exposing (Effects)
import Common.Utils exposing (none)
import Html exposing (..)
import Task
import Json.Decode exposing (..)
import Http exposing (Error(BadResponse))
import Common.Components exposing (warningCallout)
import Common.Redirect exposing (failHandler)
import Common.Http exposing (delete)

type alias Model = 
  {
    name : String
  , error : String
  }
 
init : (Model , Effects Action)
init =
  none (Model "" "")

-- Update 

type Action = 
  NoOp
  | Cancel
  | Delete
  | Deleted (Result Http.Error DeleteResponse)
  | Error String

update : Action ->  Model-> (Model , Effects Action)
update action ({name} as model) =
  case action of 
    Deleted result -> 
      failHandler result model (\_ -> none { model | error = "Failed to delete template" } ) NoOp
       
    Delete -> 
      (model, deleteTemplate name)

    _ -> 
      none model

-- View
deleteMessage : String -> List Html
deleteMessage name =
  [
     h4 [] [ text "Notice!" ]
  ,  span [] [
          text "Template" 
        , strong [] [text name] 
        , text " will be deleted! "
     ]
 ]

-- errorMessage : String -> List Html
-- errorMessage fail =
--   [
--      h4 [] [ text "Notice!" ]
--   ,  span [] [ text fail ]
--  ]
--

-- errorView:  Signal.Address Action -> String -> List Html
-- errorView address message =
--    dialogPanel address (errorMessage message) (div [] []) Cancel Delete
--  
deleteView address {name} =
   warningCallout address (deleteMessage name) (div [] []) Cancel Delete

view : Signal.Address Action -> Model -> List Html
view address model =
   deleteView address model  

type alias DeleteResponse = 
  { message : String } 

deleteResponse : Decoder DeleteResponse
deleteResponse = 
  object1 DeleteResponse
    ("message" := string) 

deleteTemplate : String -> Effects Action
deleteTemplate  name = 
  delete deleteResponse ("/templates/" ++ name)
    |> Task.toResult
    |> Task.map Deleted
    |> Effects.task

succeeded action {error} = 
  if action == (Deleted (Result.Ok { message = "Template deleted"} )) then
    True
  else
    False
