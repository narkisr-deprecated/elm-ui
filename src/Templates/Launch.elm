module Templates.Launch where

import Html.Shorthand exposing (..)
import Bootstrap.Html exposing (..)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Model.Common exposing (emptyTemplate, Template)
import Common.Utils exposing (none)
import Debug
import Html.Events exposing (onClick)
import Common.FormComponents exposing (..)
import Common.Components exposing (infoCallout, dangerCallout, panelContents, panel)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Admin.Core as Admin 
import Environments.List exposing (Environments, Environment, getEnvironments)
import Common.Http exposing (postJson, SaveResponse, saveResponse)
import Http exposing (Error(BadResponse))
import Templates.Persistency exposing (persistProvided)
import Task
import Jobs.Common as Jobs exposing (runJob, JobResponse)
import Dict exposing (Dict)
import Common.Errors as Errors exposing (errorsSuccessHandler)
import Systems.Add.Common exposing (setMachine)
import Systems.Add.Validations exposing (notAny, validationOf, notEmpty)
import Form exposing (Form)
import Form.Validate as Validate exposing (..)
import Form.Input as Input
import Form.Infix exposing (..)


type alias PartialMachine = 
  { 
      hostname : String
    , domain : String
  } 


type alias Provided = 
  {
    machine : PartialMachine
  }

type alias Model = 
  {
    name : String
  , form : Form () Provided
  , admin : Admin.Model
  , saveErrors : Errors.Model
  }
 
validate : Validation () Provided
validate =
  form1 Provided
    ("machine" := form2 PartialMachine
        ("hostname" := string)
        ("domain" := string))
    
init : (Model , Effects Action)
init =
  let 
    (admin, effects) = Admin.init
    errors = Errors.init
  in 
    (Model "" (Form.initial [] validate) admin errors, Effects.map AdminAction effects)


-- Update 

type Action = 
  SetupJob (String, String)
    | AdminAction Admin.Action 
    | ErrorsView Errors.Action
    | Launched (Result Http.Error SaveResponse)
    | FormAction Form.Action
    | JobLaunched (Result Http.Error JobResponse)
    | Launch
    | Done
    | Cancel
    | NoOp

stage : Model -> SaveResponse -> (Model, Effects Action)
stage model {id} =
  case id of
   Just num ->
     (model, runJob (toString num) "stage" JobLaunched)

   Nothing -> 
     none model

update : Action ->  Model-> (Model , Effects Action)
update action ({saveErrors, form, admin, name} as model) =
  case action of 
    FormAction formAction ->
       let 
         newForm = Form.update formAction form
       in
         none { model | form = Form.update Form.Validate newForm}

    Launch -> 
      let
        (newModel, _) = update (FormAction Form.Validate) model
      in
        if List.isEmpty (Form.getErrors newModel.form) then
          case (Form.getOutput newModel.form) of
            Just {machine} -> 
              (newModel, persistProvided (intoSystem name) machine admin)

            Nothing ->
               none newModel
        else
          none newModel

    AdminAction action -> 
      let
        (newAdmin, effects) = Admin.update action admin
      in  
        ({ model | admin = newAdmin}, Effects.map AdminAction effects)
    
    Launched result -> 
       errorsSuccessHandler result model (stage model) NoOp

    _ -> 
      none model

-- View
infoMessage : String -> List Html
infoMessage name =
  [
     h4 [] [ text "Info" ]
  ,  span [] [
          text "Launch a new system from " 
        , strong [] [text name] 
        , text " template "
     ]
 ]


machineView address form =
  let 
    formAddress = Signal.forwardTo address FormAction
    hostname = (Form.getFieldAsString "machine.hostname" form)
    domain = (Form.getFieldAsString "machine.domain" form)
  in 
   [ formControl "Hostname" Input.textInput hostname formAddress
   , formControl "Domain" Input.textInput domain formAddress 
   ]

launchView address {name, form, admin} =
   div [class "panel panel-default"] [
     div [class "panel-body"] [
       (Html.form [] [
          div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
           (List.append
              (machineView address form) 
              (Admin.view (Signal.forwardTo address AdminAction) admin))
      ])
    ]
  ]

errorMessage : List Html
errorMessage =
  [
    h4 [] [ text "Error!" ]
  , span [] [ text "Failed to save system" ]
  ]


view : Signal.Address Action -> Model -> List Html
view address ({name, saveErrors} as model) =
  let
    errorsView = (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)
  in
    if Errors.hasErrors saveErrors then
      dangerCallout address errorMessage (panel (panelContents errorsView)) Cancel Done
    else 
      infoCallout address (infoMessage name) (launchView address model) Cancel Launch

-- Effects

intoSystem : String -> String -> Effects Action
intoSystem name json = 
  postJson (Http.string json) saveResponse ("/systems/template/"  ++ name)
    |> Task.toResult
    |> Task.map Launched
    |> Effects.task


