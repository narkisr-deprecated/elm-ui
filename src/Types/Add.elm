module Types.Add where

import Html exposing (..)
import Bootstrap.Html exposing (..)
import Types.Model exposing (..)
import Dict exposing (Dict)
import Effects exposing (Effects)
import Types.Model exposing (Type, emptyType)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.Errors exposing (errorsHandler, successHandler)
import Common.Components exposing (..)
import Common.Utils exposing (none)
import Common.Errors as Errors exposing (..)
import Maybe exposing (withDefault)
import Common.Editor exposing (loadEditor, getEditor)

type alias Model = 
  {
    type' : Type
  , saveErrors : Errors.Model
  , editClasses : Bool
  }

init : (Model , Effects Action)
init =
  let
    (errorsModel, _ ) = Errors.init
  in
     none (Model emptyType errorsModel False)

type Action = 
  NameInput String
    | LoadEditor
    | DescriptionInput String
    | ErrorsView Errors.Action
    | SetClasses String
    | Save
    | Cancel
    | Done
    | NoOp

update : Action ->  Model -> (Model , Effects Action)
update action ({editClasses} as model) =
  case action of 
    LoadEditor -> 
      ({ model | editClasses = not editClasses}, loadEditor NoOp "{}")
    
    SetClasses classes -> 
      none model 

    _ -> 
      none model

editing address {type', editClasses} =
    panel
      (panelContents 
          (Html.form [] [
            div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
              group' "Name" (inputText address NameInput " "  type'.type')
            , group' "Description" (inputText address DescriptionInput " " (withDefault ""  type'.description))
            , group' "Edit classes" (checkbox address LoadEditor editClasses)
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
      dangerCallout address (error "Failed to save type") (panel (panelContents errorsView)) Cancel Done
    else 
      infoCallout address (info "Add a new Type") (editing address model) Cancel Save



