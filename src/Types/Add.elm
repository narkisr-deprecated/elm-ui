module Types.Add where

import Html exposing (..)
import Bootstrap.Html exposing (..)
import Types.Model exposing (..)
import Dict exposing (Dict)
import Effects exposing (Effects)
import Common.Errors exposing (errorsHandler, successHandler)
import Environments.List exposing (Environments, getEnvironments)
import Common.Components exposing (..)
import Common.Utils exposing (none, setEnvironments)
import Common.Errors as Errors exposing (..)
import Maybe exposing (withDefault)
import Html.Events exposing (onClick)
import Common.FormWizard as Wizard
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Http exposing (Error(BadResponse))
import Common.Editor exposing (loadEditor, getEditor)

import Types.Model exposing (Type, emptyType, emptyPuppet)
import Types.Add.Common as TypeCommon
import Types.Add.Puppet as Puppet
import Types.Add.Main as Main
import Form exposing (Form)

type alias Model = 
  {
    wizard : (Wizard.Model Step Type)
  , saveErrors : Errors.Model
  , hasNext : Bool
  , environments : List String
  , editClasses : Bool
  }

type Step = 
  Main
    | Puppet

step model value = 
  {
    form = model.form
  , value = value
  }

init : (Model , Effects Action)
init =
  let
    (errors, _ ) = Errors.init
    steps = [(step Puppet.init Puppet)]
    mainStep = (step (Main.init "") Main)
    wizard = Wizard.init mainStep steps
  in
    (Model wizard errors True [] False, getEnvironments SetEnvironments)

type Action = 
   ErrorsView Errors.Action
    | WizardAction Wizard.Action
    | FormAction Form.Action
    | SetEnvironments (Result Http.Error Environments)
    | LoadEditor
    | SetClasses String
    | Back
    | Next
    | Save
    | NoOp

setEnvironment ({environments, wizard} as model) es =
  let
    env = (Maybe.withDefault "" (List.head (Dict.keys es)))
    environments = Dict.keys es
    mainStep = (step (Main.init env) Main)
  in 
    none {model |  environments = environments, wizard = { wizard | step = Just mainStep}}



merge ({value, form} as step) acc = 
  let 
    type' = withDefault acc (Form.getOutput form)
  in 
  case value of
    Main ->  
      type'  

    Puppet -> 
      let 
        env = withDefault "" (List.head (Debug.log "" (Dict.keys acc.puppetStd)))
        puppet = withDefault emptyPuppet (Dict.get "--" type'.puppetStd)
      in 
       { type' | puppetStd = Dict.insert env puppet acc.puppetStd }


update : Action ->  Model -> (Model , Effects Action)
update action ({wizard, editClasses} as model) =
  case action of 
    Next -> 
      update (WizardAction Wizard.Next) model

    Back -> 
      update (WizardAction Wizard.Back) model

    WizardAction wizardAction -> 
      let 
        newWizard = Wizard.update wizardAction wizard
      in
        none { model | wizard = newWizard }

    FormAction formAction -> 
      let 
        newWizard = Wizard.update (Wizard.FormAction formAction) wizard
      in
        none { model | wizard = newWizard }

    SetEnvironments result ->
       (successHandler result model (setEnvironment model) NoOp)

    LoadEditor -> 
      ({ model | editClasses = not editClasses}, loadEditor NoOp "{}")

    Save -> 
      let
        merged = List.foldl merge emptyType wizard.prev 
      in 
        Debug.log (toString merged) (none model)
      
    _ -> 
      (none model)

currentView : Signal.Address Action -> Model -> List Html
currentView address ({wizard, environments, editClasses} as model) =
  let 
    environmentList = List.map (\e -> (e,e)) environments
  in 
    case wizard.step of 
      Just ({value} as current) ->
        case value of 
          Main -> 
           dialogPanel "info" (info "Add a new Type") 
            (panel (fixedPanel (Main.view environmentList (Signal.forwardTo address FormAction) current)) )

          Puppet -> 
            let
             check = (checkbox address LoadEditor editClasses)
            in 
             dialogPanel "info" (info "Module properties") 
               (panel (fixedPanel (Puppet.view check (Signal.forwardTo address FormAction) current)))
          
      Nothing -> 
        dialogPanel "info" (info "Save new type") 
           (panel (fixedPanel (div [] [text "we are done"])))


errorsView address {saveErrors} = 
   let
     body = (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)
   in
     dialogPanel "danger" (error "Failed to save type") (panel (panelContents body))

saveButton address =
    [button [id "Save", class "btn btn-primary", onClick address Save] [text "Save  "]]

view : Signal.Address Action -> Model -> List Html
view address ({wizard, saveErrors} as model) =
 [ row_ [
     (if Errors.hasErrors saveErrors then
        div [] 
          (errorsView address model)
       else
        div [class "col-md-offset-2 col-md-8"]
          (currentView address model)
       )
   ]
 , row_ (buttons address { model | hasNext = Wizard.notDone model} Next Back (saveButton address))
 ]
