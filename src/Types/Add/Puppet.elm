module Types.Add.Puppet where

import Types.Model exposing (PuppetStd, emptyPuppet)
import Effects exposing (Effects)
import Html exposing (..)
import Common.Editor exposing (loadEditor, getEditor)
import Common.Utils exposing (none)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.Components exposing (..)


type alias Model = 
  {
    puppet : PuppetStd
  , editClasses : Bool
  }
 
init : (Model , Effects Action)
init =
  none (Model emptyPuppet False)

-- Update 

type Action = 
  LoadEditor
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action ({editClasses} as model) =
  case action of 
   LoadEditor -> 
     ({ model | editClasses = not editClasses}, loadEditor NoOp "{}")
    
   NoOp -> 
     (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> Html
view address ({editClasses} as model) =
  (Html.form [] [
    div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
      group' "Edit classes" (checkbox address LoadEditor editClasses)
     , div [ id "jsoneditor"
         , style [("width", "50%"), ("height", "400px"), ("margin-left", "25%")]] []

    ]
  ])
