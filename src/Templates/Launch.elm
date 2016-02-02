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

type alias Model = 
  {
    job : String 
  , template : Template
  , admin : Admin.Model
  }
 
init : (Model , Effects Action)
init =
  let 
    (admin, effects) = Admin.init
  in 
    (Model "" emptyTemplate admin,Effects.map AdminAction effects)


-- Update 

type Action = 
  SetupJob (String, String)
    | SetTemplate Template
    | AdminAction Admin.Action 
    | Launch
    | NameInput String
    | Cancel
    | NoOp


update : Action ->  Model-> (Model , Effects Action)
update action ({admin} as model) =
  case action of 
    SetupJob (job, _) ->
      none { model | job = job }
    
    SetTemplate template -> 
      none { model | template = template } 

    AdminAction action -> 
     let
       (newAdmin, effects) = Admin.update action admin
     in  
       ({ model | admin = newAdmin} , Effects.map AdminAction effects)

    _ -> 
      none model

-- View

launch address {template, admin} =
  panelContents "Launch from template" 
    (Html.form [] [
       div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       (List.append
         [ group' "Hostname" (inputText address NameInput " "  template.name) ]
         (Admin.view (Signal.forwardTo address AdminAction) admin))
    ])

currentView : Signal.Address Action -> Model -> List Html
currentView address ({job} as model)=
  case job of 
    _ -> 
      launch address model

buttons : Signal.Address Action -> Model -> List Html
buttons address model =
  let
    margin = style [("margin-left", "30%")]
    click = onClick address
  in 
   [ 
      button [id "Cancel", class "btn btn-primary", margin, click Cancel] [text "Cancel"]
    , button [id "Save", class "btn btn-primary", margin, click Launch] [text "Ok"]
   ]
 
view :
    Signal.Address Action -> Model -> List Html
view address ({template} as model) =
 [ row_ [
     div [class "col-md-offset-2 col-md-8"] [
       div [class "panel panel-default"] (currentView address model)
     ]
   ]
 , row_ (buttons address model)
 ]

-- Effects

-- type alias SaveResponse = 
--   { message : String , id : Int } 
--
-- saveResponse : Decoder SaveResponse
-- saveResponse = 
--   object2 SaveResponse
--     ("message" := string) 
--     ("id" := int)
--
-- saveSystem : Action -> String -> Effects Action
-- saveSystem next json  = 
--   postJson (Http.string json) saveResponse "/systems"  
--     |> Task.toResult
--     |> Task.map (Saved next)
--     |> Effects.task
--
--
