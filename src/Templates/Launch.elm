module Templates.Launch exposing (..)


import Bootstrap.Html exposing (..)

import Html exposing (..)
import Html.App as App
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
import Basics.Extra exposing (never)
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
    
init : (Model , Cmd Msg)
init =
  let 
    (admin, msgs) = Admin.init
    errors = Errors.init
  in 
    (Model "" (Form.initial [] validate) admin errors, Cmd.map AdminMsg msgs)


-- Update 

type Msg = 
  SetupJob (String, String)
    | AdminMsg Admin.Msg 
    | ErrorsView Errors.Msg
    | Launched (Result Http.Error SaveResponse)
    | FormMsg Form.Msg
    | JobLaunched (Result Http.Error JobResponse)
    | Launch
    | Done
    | Cancel
    | NoOp

stage : Model -> SaveResponse -> (Model, Cmd Msg)
stage model {id} =
  case id of
   Just num ->
     (model, runJob (toString num) "stage" JobLaunched)

   Nothing -> 
     none model

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({saveErrors, form, admin, name} as model) =
  case msg of 
    FormMsg formMsg ->
       let 
         newForm = Form.update formMsg form
       in
         none { model | form = Form.update Form.Validate newForm}

    Launch -> 
      let
        (newModel, _) = update (FormMsg Form.Validate) model
      in
        if List.isEmpty (Form.getErrors newModel.form) then
          case (Form.getOutput newModel.form) of
            Just {machine} -> 
              (newModel, persistProvided (intoSystem name) machine admin)

            Nothing ->
               none newModel
        else
          none newModel

    AdminMsg msg -> 
      let
        (newAdmin, msgs) = Admin.update msg admin
      in  
        ({ model | admin = newAdmin}, Cmd.map AdminMsg msgs)
    
    Launched result -> 
       errorsSuccessHandler result model (stage model) NoOp

    _ -> 
      none model

-- View
infoMessage : String -> List (Html Msg)
infoMessage name =
  [
     h4 [] [ text "Info" ]
  ,  span [] [
          text "Launch a new system from " 
        , strong [] [text name] 
        , text " template "
     ]
 ]


machineView form =
  let 
    hostname = (Form.getFieldAsString "machine.hostname" form)
    domain = (Form.getFieldAsString "machine.domain" form)
  in 
    div [] [
       formControl "Hostname" Input.textInput hostname
     , formControl "Domain" Input.textInput domain 
    ]

launchView {name, form, admin} =
   div [class "panel panel-default"] [
     div [class "panel-body"] [
       (Html.form [] [
          div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
              (App.map FormMsg (machineView form))
           ,  (App.map AdminMsg (Admin.view admin))
           ]
      ])
    ]
  ]

errorMessage : List (Html Msg)
errorMessage =
  [
    h4 [] [ text "Error!" ]
  , span [] [ text "Failed to save system" ]
  ]


view : Model -> Html Msg
view ({name, saveErrors} as model) =
  let
    errorsView = (App.map ErrorsView (Errors.view  saveErrors))
  in
    if Errors.hasErrors saveErrors then
      dangerCallout errorMessage (panel (panelContents errorsView)) Cancel Done
    else 
      infoCallout (infoMessage name) (launchView model) Cancel Launch

-- Http

intoSystem : String -> String -> Cmd Msg
intoSystem name json = 
  postJson (Http.string json) saveResponse ("/systems/template/"  ++ name)
    |> Task.toResult
    |> Task.perform never Launched


