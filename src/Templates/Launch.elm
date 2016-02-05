module Templates.Launch where

import Html.Shorthand exposing (..)
import Bootstrap.Html exposing (..)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Model.Common exposing (emptyTemplate, Template)
import Common.Utils exposing (none)
import Debug
import Html.Events exposing (onClick)
import Common.Components exposing (panelContents, infoCallout)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Systems.Add.Common exposing (..)
import Admin.Core as Admin 
import Environments.List exposing (Environments, Environment, getEnvironments)
import Common.Http exposing (postJson)
import Http exposing (Error(BadResponse))
import Templates.Persistency exposing (persistProvided)
import Task
import Json.Decode exposing (..)

type alias Model = 
  {
    name : String
  , hostname : String
  , admin : Admin.Model
  }
 
init : (Model , Effects Action)
init =
  let 
    (admin, effects) = Admin.init
  in 
    (Model "" "" admin, Effects.map AdminAction effects)


-- Update 

type Action = 
  SetupJob (String, String)
    | Launched (Result Http.Error SaveResponse)
    | AdminAction Admin.Action 
    | Launch
    | HostnameInput String
    | Cancel
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action ({admin, name} as model) =
  case action of 
    AdminAction action -> 
     let
       (newAdmin, effects) = Admin.update action admin
     in  
       ({ model | admin = newAdmin} , Effects.map AdminAction effects)

    Launch -> 
       (model, persistProvided (intoSystem name) admin)
    
    Launched result -> 
      none model

    HostnameInput hostname -> 
        none { model | hostname = hostname }

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


launchView address {hostname, name, admin} =
   div [class "panel panel-default"] [
     div [class "panel-body"] [
       (Html.form [] [
         div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
         (List.append
           [group' "Hostname" (inputText address HostnameInput " "  hostname)]
           (Admin.view (Signal.forwardTo address AdminAction) admin))
         ])
    ]
  ]

view : Signal.Address Action -> Model -> List Html
view address ({name} as model) =
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


