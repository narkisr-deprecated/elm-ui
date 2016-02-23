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

type alias Model = 
  {
    type' : Type
  , saveErrors : Errors.Model
  }

init : (Model , Effects Action)
init =
  let
    (errorsModel, _ ) = Errors.init
  in
     none (Model emptyType errorsModel)

type Action = 
  NameInput String
    | DescriptionInput String
    | ErrorsView Errors.Action
    | Save
    | Cancel
    | Done
    | NoOp

update : Action ->  Model -> (Model , Effects Action)
update action model =
  none model

editing address {type'} =
    panel
      (panelContents 
          (Html.form [] [
            div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
              group' "Name" (inputText address NameInput " "  type'.type')
            , group' "Description" (inputText address DescriptionInput " " (withDefault ""  type'.description))
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



