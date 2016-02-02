module Templates.Launch where

import Html.Shorthand exposing (..)
import Bootstrap.Html exposing (..)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Model.Common exposing (emptyTemplate, Template)
import Common.Utils exposing (none)
import Debug
import Html.Events exposing (onClick)
import Common.Components exposing (panelContents)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Systems.Add.Common exposing (..)
import Admin.Core as Admin 
import Environments.List exposing (Environments, Environment, getEnvironments)
import Common.Http exposing (delete, postJson)
import Task
import Json.Decode exposing (..)
import Http exposing (Error(BadResponse))

type alias Model = 
  {
    job : String 
  , name : String
  , admin : Admin.Model
  }
 
init : (Model , Effects Action)
init =
  let 
    (admin, effects) = Admin.init
  in 
    (Model "" "" admin,Effects.map AdminAction effects)


-- Update 

type Action = 
  SetupJob (String, String)
    | SetTemplate Template
    | Deleted (Result Http.Error DeleteResponse)
    | Saved (Result Http.Error SaveResponse)
    | AdminAction Admin.Action 
    | Launch
    | Delete
    | NameInput String
    | Cancel
    | NoOp


update : Action ->  Model-> (Model , Effects Action)
update action ({admin, job, name} as model) =
  case action of 
    SetupJob (job, name) ->
      none { model | job = job, name = name }
    
    AdminAction action -> 
     let
       (newAdmin, effects) = Admin.update action admin
     in  
       ({ model | admin = newAdmin} , Effects.map AdminAction effects)

    Launch -> 
      case job of
        "clear" -> 
          (model, deleteTemplate name)

        "launch" -> 
          none model

        _ -> 
          none model
       
    _ -> 
      none model

-- View

launchView address {name, admin} =
  panelContents "Launch from template" 
    (Html.form [] [
       div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       (List.append
         [ group' "Hostname" (inputText address NameInput " "  name) ]
         (Admin.view (Signal.forwardTo address AdminAction) admin))
    ])

deleteView address {name, admin} =
  panelContents "Delete template" 
    (Html.form [] [
       div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
          p [] [ text ("You are about to delete " ++ name ++  "!") ]
       ]])

currentView : Signal.Address Action -> Model -> List Html
currentView address ({job} as model)=
  case job of 
    "launch" -> 
       launchView address model

    "clear" -> 
       deleteView address model

    _ -> 
      [div [] []]

buttons : Signal.Address Action -> Model -> List Html
buttons address model =
  let
    margin = style [("margin-left", "30%")]
    click = onClick address
  in 
   [ button [id "Cancel", class "btn btn-primary", margin, click Cancel] [text "Cancel"]
   , button [id "Save", class "btn btn-primary", margin, click Launch] [text "Ok"]
   ]
 
view :
    Signal.Address Action -> Model -> List Html
view address model =
 [ row_ [
     div [class "col-md-offset-2 col-md-8"] [
       div [class "panel panel-default"] (currentView address model)
     ]
   ]
 , row_ (buttons address model)
 ]

-- Effects

type alias DeleteResponse = 
  { message : String } 

deleteResponse : Decoder DeleteResponse
deleteResponse = 
  object1 DeleteResponse
    ("message" := string) 

deleteTemplate : String -> Effects Action
deleteTemplate  name = 
  delete deleteResponse ("/templates/" ++ name)
    |> Task.toResult
    |> Task.map Deleted
    |> Effects.task


type alias SaveResponse = 
  { message : String , id : Int } 

saveResponse : Decoder SaveResponse
saveResponse = 
  object2 SaveResponse
    ("message" := string) 
    ("id" := int)

intoSystem : String -> String -> Effects Action
intoSystem json name = 
  postJson (Http.string json) saveResponse ("/systems/template/"  ++ name)
    |> Task.toResult
    |> Task.map Saved
    |> Effects.task


