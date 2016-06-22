module Types.Delete exposing (..)


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
      (model, deleteType name)


    _ -> 
     (model, Effects.none)

-- View

view : Model -> List (Html Msg)
view model =
  Delete.view model "Type" Cancel Delete Done

deleteType : String -> Effects Msg
deleteType name = 
  delete deleteResponse ("/types/" ++ name)
    |> Task.toResult
    |> Task.map Deleted
    |> Effects.task

succeeded msg {error} = 
  if msg == (Deleted (Result.Ok { message = "Type deleted"} )) then
    True
  else
    False
