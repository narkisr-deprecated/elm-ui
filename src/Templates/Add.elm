module Templates.Add where

import Html.Shorthand exposing (..)
import Bootstrap.Html exposing (..)
import Common.Http exposing (postJson)
import Common.Errors exposing (errorsHandler, successHandler)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Http exposing (Error(BadResponse))
import Task exposing (Task)
import Json.Decode exposing (..)
import Effects exposing (Effects, batch)
import Dict exposing (Dict)
import Systems.Model.Common exposing (System)
import String exposing (toLower)
import Maybe exposing (withDefault)
import Common.Utils exposing (none, setEnvironments)
import Templates.Persistency exposing (persistTemplate, encodeDefaults)
import Common.Editor exposing (loadEditor)
import Common.Errors as Errors exposing (..)
import Templates.Model.Common exposing (decodeDefaults, defaultsByEnv, emptyTemplate, Template)
import Environments.List exposing (Environments, getEnvironments)
import Common.Components exposing (..)
import Debug


type alias Model = 
  {
    template : Template
  , hyp : String
  , editDefaults : Bool
  , saveErrors : Errors.Model
  , environments : List String
  }

type Action = 
  Save
  | Done
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
    errors = Errors.init
  in
    (Model emptyTemplate "" False errors [], getEnvironments SetEnvironments)   

intoTemplate ({template} as model) {type', machine, openstack, physical, aws, digital, gce} hyp = 
    let 
      withHyp = {template | openstack = openstack, physical = physical, aws = aws, digital = digital, gce = gce} 
      newTemplate = {withHyp | name = machine.hostname, type' = type', machine = machine}
    in 
      {model | template = newTemplate, hyp = hyp}


update : Action ->  Model-> (Model , Effects Action)
update action ({template, hyp, editDefaults, environments} as model) =
  case action of
    Save -> 
      (model, persistTemplate saveTemplate template hyp)

    SetSystem hyp system -> 
      none (intoTemplate model system hyp)

    LoadEditor -> 
      let
        encoded = (encodeDefaults (defaultsByEnv environments) hyp)
      in 
      ({ model | editDefaults = not editDefaults}, loadEditor "templates" NoOp encoded)
    
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
         none { model | template = newTemplate}
    
    Saved result -> 
       errorsHandler result model NoOp

    SetEnvironments result ->
       (successHandler result model (setEnvironments model) NoOp)

    _ -> 
      (model, Effects.none)

-- View

editing address {template, editDefaults} =
    panel
      (panelContents 
          (Html.form [] [
            div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
              group' "Name" (inputText address NameInput " "  template.name)
            , group' "Description" (inputText address DescriptionInput " "  template.description)
            , group' "Edit defaults" (checkbox address LoadEditor editDefaults)
            , div [ id "jsoneditor"
                  , style [("width", "50%"), ("height", "400px"), ("margin-left", "25%")]] []
           ]
          ])
        )

view : Signal.Address Action -> Model -> List Html
view address ({saveErrors} as model) =
  let
    errorsView = (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)
  in
    if Errors.hasErrors saveErrors then
      dangerCallout address (error "Failed to save template") (panel (panelContents errorsView)) Cancel Done
    else 
      infoCallout address (info "Save template") (editing address model) Cancel Save


-- Effects

type alias SaveResponse = 
  {
    message : String
  } 

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


