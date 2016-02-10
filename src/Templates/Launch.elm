module Templates.Launch where

import Common.Redirect as Redirect exposing (successHandler)
import Html.Shorthand exposing (..)
import Bootstrap.Html exposing (..)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Model.Common exposing (emptyTemplate, Template)
import Common.Utils exposing (none)
import Debug
import Html.Events exposing (onClick)
import Common.Components exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Admin.Core as Admin 
import Environments.List exposing (Environments, Environment, getEnvironments)
import Common.Http exposing (postJson)
import Http exposing (Error(BadResponse))
import Templates.Persistency exposing (persistProvided)
import Task
import Json.Decode exposing (..)
import Jobs.Common as Jobs exposing (runJob, JobResponse)
import Dict exposing (Dict)
import Common.Errors as Errors exposing (..)
import Systems.Add.Common exposing (setMachine)
import Systems.Add.Validations exposing (notAny, validationOf, notEmpty)

type alias PartialMachine = 
  { 
      hostname : String
    , domain : String
  } 

type alias Model = 
  {
    name : String
  , machine : PartialMachine
  , admin : Admin.Model
  , saveErrors : Errors.Model
  , errors : Dict String (List Systems.Add.Validations.Error)
  }
 
init : (Model , Effects Action)
init =
  let 
    (admin, effects) = Admin.init
    (errors, _) = Errors.init
    machine = PartialMachine "" "" 
  in 
    (Model "" machine admin errors Dict.empty, Effects.map AdminAction effects)


-- Update 

type Action = 
  SetupJob (String, String)
    | Launched (Result Http.Error SaveResponse)
    | JobLaunched (Result Http.Error JobResponse)
    | AdminAction Admin.Action 
    | Launch
    | Done
    | HostnameInput String
    | Cancel
    | NoOp

setSaved : Model -> SaveResponse -> (Model, Effects Action)
setSaved model {id} =
  (model, runJob (toString id) "stage" JobLaunched)

update : Action ->  Model-> (Model , Effects Action)
update action ({errors, admin, name} as model) =
  case action of 
    AdminAction action -> 
     let
       (newAdmin, effects) = Admin.update action admin
     in  
       ({ model | admin = newAdmin} , Effects.map AdminAction effects)

    Launch -> 
      if (notAny errors) then
       (model, persistProvided (intoSystem name) admin)
      else 
       none model
    
    Launched result -> 
      let
        (({saveErrors} as newModel), effects) = successHandler result model (setSaved model) NoOp
      in
        (newModel , effects)

    HostnameInput hostname -> 
      model
        |> setMachine (\machine -> {machine | hostname = hostname })
        |> (validationOf "Hostname" [notEmpty] (\{machine} -> machine.hostname))
        |> none

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


launchView address {machine, name, admin} =
   div [class "panel panel-default"] [
     div [class "panel-body"] [
       (Html.form [] [
         div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
         (List.append
           [group' "Hostname" (inputText address HostnameInput " "  machine.hostname)]
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
  if not (Dict.isEmpty saveErrors.errors.keyValues) then
    dangerCallout address (errorMessage) (div [] []) Cancel Done
  else 
    infoCallout address (infoMessage name) (launchView address model) Cancel Launch

-- Effects


type alias SaveResponse = 
  {
    message : String 
  , id : Int 
  } 

saveResponse : Decoder SaveResponse
saveResponse = 
  object2 SaveResponse
    ("message" := string) 
    ("id" := int)

intoSystem : String -> String -> Effects Action
intoSystem name json = 
  postJson (Http.string json) saveResponse ("/systems/template/"  ++ name)
    |> Task.toResult
    |> Task.map Launched
    |> Effects.task


