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
import Common.Components exposing (dialogPanel)
import Common.Redirect exposing (failHandler)

type alias Model = 
  {
    job : String 
  , name : String
  , admin : Admin.Model
  , state : State
  }
 
type State = 
  Errored String
   | Launching
   | Deleting

init : (Model , Effects Action)
init =
  let 
    (admin, effects) = Admin.init
  in 
    (Model "" "" admin Launching, Effects.map AdminAction effects)


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

toState : String -> State
toState job =
  case job of 
   "clear" -> 
       Deleting

   "launch" -> 
       Launching

   _ -> 
      Errored "no state"


update : Action ->  Model-> (Model , Effects Action)
update action ({admin, job, name, state} as model) =
  case action of 
    SetupJob (job, name) ->
      none { model | job = job, name = name, state = toState job }
    
    AdminAction action -> 
     let
       (newAdmin, effects) = Admin.update action admin
     in  
       ({ model | admin = newAdmin} , Effects.map AdminAction effects)

    Deleted result -> 
      failHandler result model (\_ -> none { model | state = Errored "Failed to delete template" } ) NoOp
       
    Delete -> 
      (model, deleteTemplate name)

    Launch -> 
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

deleteMessage : String -> List Html
deleteMessage name =
  [
     h4 [] [ text "Notice!" ]
  ,  span [] [
          text "Template" 
        , strong [] [text name] 
        , text " will be deleted! "
     ]
 ]

deleteView address {name, admin} =
   dialogPanel address (deleteMessage name) (div [] []) Cancel Delete


errorMessage : String -> List Html
errorMessage fail =
  [
     h4 [] [ text "Notice!" ]
  ,  span [] [ text fail ]
 ]

errorView:  Signal.Address Action -> String -> List Html
errorView address message =
   dialogPanel address (errorMessage message) (div [] []) Cancel Delete

currentView : Signal.Address Action -> Model -> List Html
currentView address ({job, state} as model)=
  case state of 
    Launching -> 
       launchView address model

    Deleting -> 
       deleteView address model

    Errored message -> 
       errorView address message


view : Signal.Address Action -> Model -> List Html
view address model =
 [div[] (currentView address model)]

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


