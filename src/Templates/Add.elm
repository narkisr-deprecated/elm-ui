module Templates.Add where

import Html.Shorthand exposing (..)
import Bootstrap.Html exposing (..)
import Common.Http exposing (postJson)
import Common.Redirect as Redirect exposing (resultHandler, successHandler)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Http exposing (Error(BadResponse))
import Task exposing (Task)
import Json.Decode exposing (..)
import Json.Encode as E
import Effects exposing (Effects, batch)
import Dict exposing (Dict)
import Systems.Model.Common exposing (System, emptySystem)
import String exposing (toLower)
import Maybe exposing (withDefault)
import Common.Utils exposing (none)
-- Add models

type alias Model = 
  {
    system : System
  , stage : String 
  }

type Action = 
  SaveTemplate
  | NoOp
  | TemplateSaved (Result Http.Error SaveResponse)
  | SetSystem System

init =
  none (Model emptySystem "")   

-- update : Action ->  Model-> (Model , Effects Action)
-- update action ({system} as model) =
--   case action of
--
--     SaveTemplate -> 
--        persistModel saveTemplate model NoOp
--
--     TemplateSaved result -> 
--       let
--         success = (setSaved next model)
--         (({saveErrors} as newModel), effects) = resultHandler result model success (setErrors model) NoOp
--       in
--          if not (Dict.isEmpty saveErrors.errors.keyValues) then
--            ({newModel | stage = Error} , Effects.none)
--          else
--            (model, effects)
--
--     _ -> (model, Effects.none)
--

view : Signal.Address Action -> Model -> List Html
view address model =
 [ row_ [
     div [class "col-md-offset-2 col-md-8"] [
       div [class "panel panel-default"] [text "add a template"]
     ]
   ]
 ]

-- Effects

type alias SaveResponse = 
  { message : String , id : Int } 

saveResponse : Decoder SaveResponse
saveResponse = 
  object2 SaveResponse
    ("message" := string) 
    ("id" := int)

saveTemplate: String -> Action -> Effects Action
saveTemplate model next = 
  postJson (Http.string model) saveResponse "/templates"  
    |> Task.toResult
    |> Task.map TemplateSaved
    |> Effects.task


