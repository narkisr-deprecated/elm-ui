module Types.Delete where

import Effects exposing (Effects)
import Html exposing (..)
import Common.Utils exposing (none)
import Common.Components exposing (asList)
import Common.Delete as Delete exposing (deleteResponse, DeleteResponse)
import Common.Http exposing (delete)
import Http exposing (Error(BadResponse))
import Task
import Maybe exposing (withDefault)
import Common.Errors exposing (failHandler)


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
      (model, deleteType name)


    _ -> 
     (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> List Html
view address model =
  Delete.view address model "Type" Cancel Delete Done

deleteType : String -> Effects Action
deleteType name = 
  delete deleteResponse ("/types/" ++ name)
    |> Task.toResult
    |> Task.map Deleted
    |> Effects.task

succeeded action {error} = 
  if action == (Deleted (Result.Ok { message = "Type deleted"} )) then
    True
  else
    False
