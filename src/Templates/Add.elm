module Templates.Add where

import Html.Shorthand exposing (..)
import Bootstrap.Html exposing (..)
import Common.Http exposing (postJson)
import Common.Redirect as Redirect exposing (errorsHandler, successHandler)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Http exposing (Error(BadResponse))
import Task exposing (Task)
import Json.Decode exposing (..)
import Json.Encode as E
import Effects exposing (Effects, batch)
import Dict exposing (Dict)
import Systems.Model.Common exposing (System)
import String exposing (toLower)
import Maybe exposing (withDefault)
import Common.Utils exposing (none)
import Templates.Persistency exposing (persistTemplate, encodeDefaults)
import Common.Components exposing (panelContents)
import Systems.Add.Common exposing (..)
import Common.Editor exposing (loadEditor, getEditor)
import Common.Errors as Errors exposing (..)
import Templates.Model.Common exposing (decodeDefaults, defaultsByEnv, emptyTemplate, Template)
import Environments.List exposing (Environments, getEnvironments)
import Debug


type alias Model = 
  {
    template : Template
  , hyp : String
  , editDefaults : Bool
  , saveErrors : Errors.Model
  , environments : List String
  , stage : Stage
  }

type Stage = 
  Editing
    | Error

type Action = 
  SaveTemplate
  | NoOp
  | Cancel
  | LoadEditor
  | SetDefaults String
  | Saved (Result Http.Error SaveResponse)
  | SetSystem String System
  | NameInput String
  | DescriptionInput String
  | DefaultsInput String
  | SetEnvironments (Result Http.Error Environments)
  | ErrorsView Errors.Action

init =
  let
    (errorsModel, _ ) = Errors.init
  in
    (Model emptyTemplate "" False errorsModel [] Editing, getEnvironments SetEnvironments)   

intoTemplate ({template} as model) {type', machine, openstack, physical, aws, digital, gce} hyp = 
    let 
      withHyp = {template | openstack = openstack, physical = physical, aws = aws, digital = digital, gce = gce} 
      newTemplate = {withHyp | name = machine.hostname, type' = type', machine = machine}
    in 
      {model | template = newTemplate, hyp = hyp, stage = Editing}

setEnvironments : Model -> Environments -> (Model, Effects Action)
setEnvironments model es =
   none {model | environments = Dict.keys es}


update : Action ->  Model-> (Model , Effects Action)
update action ({template, hyp, editDefaults, environments} as model) =
  case action of
    SaveTemplate -> 
      if editDefaults == False then
        (model, persistTemplate saveTemplate template hyp)
      else
        (model, getEditor NoOp)

    SetSystem hyp system -> 
      none (intoTemplate model system hyp)

    LoadEditor -> 
      let
        encoded = (encodeDefaults (defaultsByEnv environments) hyp)
      in 
      ({ model | editDefaults = not editDefaults}, loadEditor NoOp encoded)
    
    NameInput name -> 
      let 
        newTemplate = { template | name = name }
      in 
        none { model | template = newTemplate} 

    DescriptionInput description -> 
      let 
        newTemplate = { template | description = description }
      in 
        none { model | template = newTemplate} 


    SetDefaults json -> 
       let 
         newTemplate = { template | defaults = Just (decodeDefaults json) }
       in 
         ({ model | template = newTemplate}, persistTemplate saveTemplate template hyp)
    
    Saved result -> 
      let
        (({saveErrors} as newModel), effects) = errorsHandler result model NoOp
      in
         if not (Dict.isEmpty saveErrors.errors.keyValues) then
           ({newModel | stage = Error} , Effects.none)
         else
           (model, effects)

    SetEnvironments result ->
       (successHandler result model (setEnvironments model) NoOp)

    _ -> 
      (model, Effects.none)

-- View

currentView : Signal.Address Action -> Model -> List Html
currentView address ({stage, saveErrors} as model)=
  case stage of 
    Editing -> 
      editing model address

    Error -> 
      (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)

   
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
 

editing ({template, editDefaults} as model) address  =
  panelContents 
    (Html.form [] [
       div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
         group' "Name" (inputText address NameInput " "  template.name)
       , group' "Description" (inputText address DescriptionInput " "  template.description)
       , group' "Edit defaults" (checkbox address LoadEditor editDefaults)
       , div [id "jsoneditor", style [("width", "550px"), ("height", "400px"), ("margin-left", "25%")]] []
       ]
        
  ])

view : Signal.Address Action -> Model -> List Html
view address  model =
 [ row_ [
     div [class "col-md-offset-2 col-md-8"] [
       div [class "panel panel-default"] (currentView address model)
     ]
   ]
 , row_ (buttons address model)
 ]

-- Effects

type alias SaveResponse = 
  { message : String } 

saveResponse : Decoder SaveResponse
saveResponse = 
  object1 SaveResponse
    ("message" := string) 

saveTemplate: String -> Effects Action
saveTemplate json = 
  postJson (Http.string json) saveResponse "/templates"  
    |> Task.toResult
    |> Task.map Saved
    |> Effects.task


