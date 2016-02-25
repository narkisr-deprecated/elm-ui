module Types.Add where

import Html exposing (..)
import Bootstrap.Html exposing (..)
import Types.Model exposing (..)
import Dict exposing (Dict)
import Effects exposing (Effects)
import Common.Errors exposing (errorsHandler, successHandler)
import Common.Components exposing (..)
import Common.Utils exposing (none)
import Common.Errors as Errors exposing (..)
import Maybe exposing (withDefault)
import Html.Events exposing (onClick)
import Common.Wizard as Wizard
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)

import Types.Model exposing (Type, emptyType)
import Types.Add.Puppet as Puppet
import Types.Add.Main as Main

type alias Model = 
  {
    wizard : (Wizard.Model Step)
  , puppet : Puppet.Model
  , main : Main.Model
  , saveErrors : Errors.Model
  , hasNext : Bool
  }

init : (Model , Effects Action)
init =
  let
    wizard = Wizard.init Main Main [Main, Puppet]
    (errors, _ ) = Errors.init
    (main, mainEffects ) = Main.init
    (puppet, puppetEffects ) = Puppet.init
    effects = [
    ]
  in
    (Model wizard puppet main errors True, Effects.batch effects)

type Step = 
    Main
     | Puppet
     | Error

type Action = 
   ErrorsView Errors.Action
    | WizardAction Wizard.Action
    | SetClasses String
    | PuppetAction Puppet.Action 
    | MainAction Main.Action 
    | Back
    | Next
    | Save
    | NoOp

update : Action ->  Model -> (Model , Effects Action)
update action model =
  case action of 
    Next -> 
      Debug.log "" (update (WizardAction Wizard.Next) model)

    Back -> 
       update (WizardAction Wizard.Back) model

    _ -> 
      none model

currentView : Signal.Address Action -> Model -> List Html
currentView address ({wizard, puppet, main} as model) =
  case wizard.step of 
    Puppet -> 
      dialogPanel "info" (info "Puppet standalone") (panel (panelContents (Puppet.view (Signal.forwardTo address PuppetAction) puppet)))

    Main -> 
      dialogPanel "info" (info "Add a new Type") (panel (panelContents (Main.view (Signal.forwardTo address MainAction) main))) 
      
    _ -> 
       asList notImplemented

errorsView address {saveErrors} = 
   let
     body = (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)
   in
     dialogPanel "danger" (error "Failed to save type") (panel (panelContents body))

saveButton address =
    [button [id "Save", class "btn btn-primary", onClick address Save] [text "Save"]]

view : Signal.Address Action -> Model -> List Html
view address ({wizard} as model) =
 [ row_ [
     (if wizard.step /= Error then
        div [class "col-md-offset-2 col-md-8"] 
          (currentView address model) 
       else
         div [] (errorsView address model))
   ]
 , row_ (buttons address model Next Back (saveButton address))
 ]
