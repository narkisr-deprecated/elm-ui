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
import Systems.Add.Persistency exposing (persistModel)
import Common.Components exposing (panelContents)
import Systems.Add.Common exposing (..)
import Common.Editor exposing (loadEditor)
import Debug


type alias Model = 
  {
    system : System
  , stage : String
  , editDefaults : Bool
  }

type Action = 
  SaveTemplate
  | NoOp
  | Cancel
  | LoadEditor
  | TemplateSaved (Result Http.Error SaveResponse)
  | SetSystem System
  | NameInput String
  | DefaultsInput String

init =
  none (Model emptySystem "" False)   

update : Action ->  Model-> (Model , Effects Action)
update action ({system, stage} as model) =
  case action of
    SaveTemplate -> 
      (model, persistModel saveTemplate system stage)

    SetSystem newSystem -> 
      none (Debug.log (toString newSystem) {model | system = newSystem })

    LoadEditor -> 
      (model, loadEditor NoOp "{\"defaults\":{\"openstack\":{\"networks\":[]}}}")
    
    NameInput name -> 
      let 
        newSystem = { system | name = Just name }
      in 
        none { model | system = newSystem} 

    -- TemplateSaved result -> 
    --   let
    --     success = (setSaved next model)
    --     (({saveErrors} as newModel), effects) = resultHandler result model success (setErrors model) NoOp
    --   in
    --      if not (Dict.isEmpty saveErrors.errors.keyValues) then
    --        ({newModel | stage = Error} , Effects.none)
    --      else
    --        (model, effects)
    --

    _ -> 
      (model, Effects.none)

    
buttons : Signal.Address Action -> Model -> List Html
buttons address model =
  let
    margin = style [("margin-left", "30%")]
    click = onClick address
  in 
    [ 
      button [id "Cancel", class "btn btn-primary", margin, click Cancel] [text "Cancel"]
    , button [id "Save", class "btn btn-primary", margin, click SaveTemplate] [text "Save"]
    ]
 
view : Signal.Address Action -> Model -> List Html
view address ({system, editDefaults} as model) =
 [ row_ [
     div [class "col-md-offset-2 col-md-8"] [
       div [class "panel panel-default"]
         (panelContents "New Template" 
           (Html.form [] [
             div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
                  group' "Name" (inputText address NameInput " " (withDefault "" system.name))
                , group' "Edit defaults" (checkbox address LoadEditor editDefaults)
                , div [id "jsoneditor", style [("width", "550px"), ("height", "400px"), ("margin-left", "25%")]] []
                ]
                 
           ]))
     ]
   ]
 , row_ (buttons address model)
 ]

-- Effects

type alias SaveResponse = 
  { message : String , id : Int } 

saveResponse : Decoder SaveResponse
saveResponse = 
  object2 SaveResponse
    ("message" := string) 
    ("id" := int)

saveTemplate: String -> Effects Action
saveTemplate json = 
  postJson (Http.string json) saveResponse "/templates"  
    |> Task.toResult
    |> Task.map TemplateSaved
    |> Effects.task


