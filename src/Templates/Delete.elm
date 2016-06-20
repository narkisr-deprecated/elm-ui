module Templates.Delete exposing (..)


import Common.Utils exposing (none)
import Html exposing (..)
import Task
import Http exposing (Error(BadResponse))
import Common.Components exposing (dangerCallout, error)
import Common.Errors exposing (failHandler)
import Common.Http exposing (delete)
import Maybe exposing (withDefault)
import Common.Delete as Delete exposing (deleteResponse, DeleteResponse)

type alias Model = 
  {
    name : String
  , errorMsg : String
  }
 
init : (Model , Effects Action)
init =
  none (Model "" "")

-- Update 

type Action = 
  NoOp
  | Cancel
  | Delete
  | Done
  | Deleted (Result Http.Error DeleteResponse)
  | Error String

update : Action ->  Model-> (Model , Effects Action)
update action ({name} as model) =
  case action of 
    Deleted result -> 
      failHandler result model (\{message} -> none { model | errorMsg = withDefault "Failed to delete template" message }) NoOp
       
    Delete -> 
      (model, deleteTemplate name)

    _ -> 
      none model

-- View

view : Signal.Address Action -> Model -> List Html
view address model =
  Delete.view address model "Template" Cancel Delete Done

deleteTemplate : String -> Effects Action
deleteTemplate  name = 
  delete deleteResponse ("/templates/" ++ name)
    |> Task.toResult
    |> Task.map Deleted
    |> Effects.task

succeeded action {errorMsg} = 
  if action == (Deleted (Result.Ok { message = "Template deleted"} )) then
    True
  else
    False
