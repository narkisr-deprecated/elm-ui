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


type alias Model = 
  {
    job : String 
  , template : Template
  }
 
init : (Model , Effects Action)
init =
  none (Model "" emptyTemplate)

-- Update 

type Action = 
  SetupJob (String, String)
    | SetTemplate Template
    | LaunchJob
    | NameInput String
    | Cancel
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
    SetupJob (job, _) ->
      none { model | job = job }
    
    SetTemplate template -> 
      none { model | template = template } 

    _ -> 
      none model

-- View

launch address  {template} =
  panelContents "Launch from template" 
    (Html.form [] [
       div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
         group' "Instance name" (inputText address NameInput " "  template.name)
       ]
        
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
    , button [id "Save", class "btn btn-primary", margin, click LaunchJob] [text "Ok"]
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


