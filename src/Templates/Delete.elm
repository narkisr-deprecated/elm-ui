module Templates.Delete exposing (..)


import Common.Utils exposing (none)
import Html exposing (..)
import Task
import Http exposing (Error(BadResponse))
import Common.Components exposing (dangerCallout, error)
import Common.Errors exposing (failHandler)
import Common.Http exposing (delete)
import Basics.Extra exposing (never)
import Maybe exposing (withDefault)
import Common.Delete as Delete exposing (deleteResponse, DeleteResponse)

type alias Model = 
  {
    name : String
  , errorMsg : String
  }
 
init : (Model , Cmd Msg)
init =
  none (Model "" "")

-- Update 

type Msg = 
  NoOp
  | Cancel
  | Delete
  | Done
  | Deleted (Result Http.Error DeleteResponse)
  | Error String

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({name} as model) =
  case msg of 
    Deleted result -> 
      failHandler result model (\{message} -> none { model | errorMsg = withDefault "Failed to delete template" message }) NoOp
       
    Delete -> 
      (model, deleteTemplate name)

    _ -> 
      none model

-- View

view : Model -> Html Msg
view model =
  Delete.view model "Template" Cancel Delete Done

deleteTemplate : String -> Cmd Msg
deleteTemplate  name = 
  delete deleteResponse ("/templates/" ++ name)
    |> Task.toResult
    |> Task.perform never Deleted

succeeded msg {errorMsg} = 
  if msg == (Deleted (Result.Ok { message = "Template deleted"} )) then
    True
  else
    False
