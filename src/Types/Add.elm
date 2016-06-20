module Types.Add exposing (..)

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
import Common.Editor exposing (loadEditor, unloadEditor)
import Json.Decode exposing (..)
import Common.Http exposing (saveResponse, postJson, putJson, SaveResponse)
import Task exposing (Task)
import Types.Persistency exposing (persistType, encodeClasses)
import Types.View exposing (summarize)
import Common.Model exposing (Options)

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
  , classes : (Dict String Options)
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
    errors = Errors.init
    steps = [(step Puppet.init Puppet)]
    mainStep = (step (Main.init "") Main)
    wizard = Wizard.init mainStep steps
  in
    (Model wizard errors True [] False Dict.empty, getEnvironments SetEnvironments)

reinit : Model -> Type -> String -> Model
reinit model ({puppetStd} as type') env  = 
  let
    steps = [(step (Puppet.reinit env type') Puppet)]
    mainStep = (step (Main.reinit env type') Main)
    newWizard = Wizard.init mainStep steps
    classes = (withDefault emptyPuppet (Dict.get env puppetStd)).classes
  in
    { model | wizard = newWizard, classes = classes, editClasses = False, saveErrors = Errors.init } 

type Action = 
   ErrorsView Errors.Action
    | WizardAction Wizard.Action
    | FormAction Form.Action
    | SetEnvironments (Result Http.Error Environments)
    | LoadEditor String
    | SetClasses String
    | Reset
    | Done
    | Back
    | Next
    | Save (String -> Effects Action)
    | Saved (Result Http.Error SaveResponse)
    | NoOp

setEnvironment ({environments, wizard} as model) es =
  let
    env = (Maybe.withDefault "" (List.head (Dict.keys es)))
    environments = Dict.keys es
    mainStep = (step (Main.init env) Main)
  in 
    none {model |  environments = environments, wizard = { wizard | step = Just mainStep}}

merge classes ({value, form} as step) acc = 
  let 
    type' = withDefault acc (Form.getOutput form)
  in 
   case value of
     Main ->  
       type'  
 
     Puppet -> 
       let 
         env = withDefault "" (List.head (Dict.keys acc.puppetStd))
         puppet = withDefault emptyPuppet (Dict.get "--" type'.puppetStd)
         withClasses = { puppet | classes = classes }
       in 
         { acc | puppetStd = Dict.insert env withClasses acc.puppetStd }

merged {wizard, classes} =
  List.foldl (merge classes) emptyType wizard.prev 

update : Action ->  Model -> (Model , Effects Action)
update action ({wizard, editClasses, classes} as model) =
  case action of 
    Next -> 
      let
       (next, effects) = update (WizardAction Wizard.Next) model
      in
       (next, Effects.batch [effects , unloadEditor NoOp])

    Back -> 
      let
        (back, _) = (update (WizardAction Wizard.Back) model)
      in
       ({ back | editClasses = False}, unloadEditor NoOp)

    Reset -> 
      let
        (back,_) = (update (WizardAction Wizard.Back) model)
      in
       ({ back | editClasses = False, saveErrors = Errors.init }, unloadEditor NoOp)


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

    LoadEditor dest -> 
      ({ model | editClasses = not editClasses}, loadEditor dest NoOp (encodeClasses classes))

    SetClasses json -> 
        none { model | classes = decodeClasses json }

    Save f -> 
      (model, persistType f (merged model))

    Saved result -> 
       errorsHandler result model NoOp

    _ -> 
      (none model)

currentView : Signal.Address Action -> Model -> List Html
currentView address ({wizard, environments, editClasses, classes} as model) =
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
             check = (checkbox address (LoadEditor "typesAdd") editClasses)
            in 
             dialogPanel "info" (info "Module properties") 
               (panel (fixedPanel (Puppet.view check (Signal.forwardTo address FormAction) current)))
          
      Nothing -> 
        dialogPanel "info" (info "Save new type") 
           (panel (fixedPanel (summarize (merged model))))


errorsView address {saveErrors} = 
   let
     body = (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)
   in
     dialogPanel "danger" (error "Failed to save type") (panel (panelContents body))

saveButton address =
    [button [id "Save", class "btn btn-primary", onClick address (Save saveType) ] [text "Save  "]]

doneButton address =
    [button [id "Done", class "btn btn-primary", onClick address (Save saveType) ] [text "Done "]]


rows contents buttons = 
 [ 
  row_ [
    contents
  ]
 ,row_ buttons
 ]

view : Signal.Address Action -> Model -> List Html
view address ({wizard, saveErrors} as model) =
  let 
    buttons' = (buttons address { model | hasNext = Wizard.notDone model})
  in 
   if Errors.hasErrors saveErrors then
    rows 
     (div [] (errorsView address model))
     (buttons' Done Reset (doneButton address))
    else
     rows 
      (div [class "col-md-offset-2 col-md-8"] (currentView address model))
      (buttons' Next Back (saveButton address))

saveType: String -> Effects Action
saveType json = 
  postJson (Http.string json) saveResponse "/types"  
    |> Task.toResult
    |> Task.map Saved
    |> Effects.task

updateType: String -> Effects Action
updateType json = 
  putJson (Http.string json) saveResponse "/types"  
    |> Task.toResult
    |> Task.map Saved
    |> Effects.task


