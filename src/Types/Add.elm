module Types.Add exposing (..)

import Html exposing (..)
import Html.App as App
import Bootstrap.Html exposing (..)
import Types.Model exposing (..)
import Dict exposing (Dict)

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
import Json.Decode exposing (..)
import Basics.Extra exposing (never)
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

init : (Model , Cmd Msg)
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

type Msg = 
   ErrorsView Errors.Msg
    | WizardMsg Wizard.Msg
    | FormMsg Form.Msg
    | SetEnvironments (Result Http.Error Environments)
    | SetClasses String
    | Reset
    | Done
    | Back
    | Next
    | Save (String -> Cmd Msg)
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

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({wizard, editClasses, classes} as model) =
  case msg of 
    -- Next -> 
    --   let
    --    (next, msgs) = update (WizardMsg Wizard.Next) model
    --   in
    --    (next, Cmd.batch [msgs , unloadEditor NoOp])
    --
    -- Back -> 
    --   let
    --     (back, _) = (update (WizardMsg Wizard.Back) model)
    --   in
    --    ({ back | editClasses = False}, unloadEditor NoOp)
    --
    -- Reset -> 
    --   let
    --     (back,_) = (update (WizardMsg Wizard.Back) model)
    --   in
    --    ({ back | editClasses = False, saveErrors = Errors.init }, unloadEditor NoOp)
    --

    WizardMsg wizardMsg -> 
      let 
        newWizard = Wizard.update wizardMsg wizard
      in
        none { model | wizard = newWizard }

    FormMsg formMsg -> 
      let 
        newWizard = Wizard.update (Wizard.FormMsg formMsg) wizard
      in
        none { model | wizard = newWizard }

    SetEnvironments result ->
       (successHandler result model (setEnvironment model) NoOp)

    -- LoadEditor dest -> 
    --   ({ model | editClasses = not editClasses}, loadEditor dest NoOp (encodeClasses classes))
    --
    SetClasses json -> 
        none { model | classes = decodeClasses json }

    Save f -> 
      (model, persistType f (merged model))

    Saved result -> 
       errorsHandler result model NoOp

    _ -> 
      (none model)

currentView : Model -> List (Html Msg)
currentView ({wizard, environments, editClasses, classes} as model) =
  let 
    environmentList = List.map (\e -> (e,e)) environments
  in 
    case wizard.step of 
      Just ({value} as current) ->
        case value of 
          Main -> 
           dialogPanel "info" (info "Add a new Type") 
            (panel (fixedPanel (App.map FormMsg (Main.view environmentList current))))

          Puppet -> 
             dialogPanel "info" (info "Module properties") 
               (panel (fixedPanel (App.map FormMsg (Puppet.view current))))
          
      Nothing -> 
        dialogPanel "info" (info "Save new type") 
           (panel (fixedPanel (App.map (\_ -> NoOp) (summarize (merged model)))))


errorsView {saveErrors} = 
   let
     body = (App.map ErrorsView (Errors.view saveErrors))
   in
     dialogPanel "danger" (error "Failed to save type") (panel (panelContents body))

saveButton =
    [button [id "Save", class "btn btn-primary", onClick (Save saveType) ] [text "Save  "]]

doneButton =
    [button [id "Done", class "btn btn-primary", onClick (Save saveType) ] [text "Done "]]


rows contents buttons = 
 div [] [ 
  row_ [
    contents
  ]
 ,row_ buttons
 ]

view : Model -> Html Msg
view ({wizard, saveErrors} as model) =
  let 
    buttons' = (buttons { model | hasNext = Wizard.notDone model})
  in 
   if Errors.hasErrors saveErrors then
    rows 
     (div [] (errorsView model))
     (buttons' Done Reset doneButton)
    else
     rows 
      (div [class "col-md-offset-2 col-md-8"] (currentView model))
      (buttons' Next Back saveButton)

saveType: String -> Cmd Msg
saveType json = 
  postJson (Http.string json) saveResponse "/types"  
    |> Task.toResult
    |> Task.perform never Saved

updateType: String -> Cmd Msg
updateType json = 
  putJson (Http.string json) saveResponse "/types"  
    |> Task.toResult
    |> Task.perform never Saved


