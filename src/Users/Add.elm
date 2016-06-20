module Users.Add exposing (..)


import Html exposing (..)
import Bootstrap.Html exposing (..)
import Dict exposing (Dict)

import Common.Errors exposing (errorsHandler, successHandler)
import Environments.List exposing (Environments, getEnvironmentKeys)
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
import Common.Model exposing (Options)
import Common.Http exposing (getJson)

import Users.Model exposing (User, emptyUser, getRoles)
import Users.Add.Perm as Perm
import Users.Add.Main as Main
import Users.View exposing (summarize)
import Form exposing (Form)

type alias Model = 
  {
    wizard : (Wizard.Model Step User)
  , saveErrors : Errors.Model
  , hasNext : Bool
  , roles : List (String,String)
  , environments : List (String,String)
  , operations : List (String,String)
  }

type Step = 
  Main
    | Perm

step model value = 
  {
    form = model.form
  , value = value
  }

init : (Model , Effects Action)
init =
  let
    errors = Errors.init
    steps = [(step Perm.init Perm)]
    mainStep = (step (Main.init "") Main)
    wizard = Wizard.init mainStep steps
    effects = [
       getRoles SetRoles
    ,  getEnvironmentKeys SetEnvironments
    ,  getOperations SetOperations
    ]

  in
    (Model wizard errors False [] [] [],Effects.batch effects)

type Action = 
   ErrorsView Errors.Action
    | WizardAction Wizard.Action
    | FormAction Form.Action
    | SetRoles (Result Http.Error (Dict String String))
    | SetEnvironments (Result Http.Error (List String))
    | SetOperations (Result Http.Error (List String))
    | Reset
    | Done
    | Back
    | Next
    | Save (String -> Effects Action)
    | Saved (Result Http.Error SaveResponse)
    | NoOp

merge ({value, form} as step) acc = 
  let 
    user = withDefault acc (Form.getOutput form)
  in 
   case value of
     Main ->  
       user
 
     Perm -> 
       user

merged {wizard} =
  List.foldl merge emptyUser wizard.prev 

setRoles ({wizard} as model) roles =
  let
     role = (Maybe.withDefault "" (List.head (Dict.values roles)))
     mainStep = (step (Main.init role) Main)
     pairs = List.map (\(f,s) -> (s, f)) (Dict.toList roles)
  in
    none { model | roles = pairs, wizard = { wizard | step = Just mainStep }}

setEnvironment model keys =
  let
    env = (Maybe.withDefault "" (List.head keys))
    pairs = List.map (\key -> (key,key) ) keys
  in 
   none { model | environments = pairs }

setOperation model keys =
  let
    op = (Maybe.withDefault "" (List.head keys))
    pairs = List.map (\key -> (key,key) ) keys
  in 
   none { model | operations = pairs }



update : Action ->  Model -> (Model , Effects Action)
update action ({wizard} as model) =
  case action of 
    Next -> 
      update (WizardAction Wizard.Next) model

    Back -> 
       update (WizardAction Wizard.Back) model

    Reset -> 
      let
        (back,_) = (update (WizardAction Wizard.Back) model)
      in
        none { back | saveErrors = Errors.init }

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

    SetRoles result ->
      (successHandler result model (setRoles model) NoOp)

    SetEnvironments result ->
       (successHandler result model (setEnvironment model) NoOp)

    SetOperations result ->
       (successHandler result model (setOperation model) NoOp)

    Save f -> 
      none model
      -- (model, persistType f (merged model))

    Saved result -> 
       errorsHandler result model NoOp

    _ -> 
      (none model)

currentView : Signal.Address Action -> Model -> List Html
currentView address ({wizard, roles, environments, operations} as model) =
  case wizard.step of 
    Just ({value} as current) ->
      case value of 
        Main -> 
          dialogPanel "info" (info "Add a new User") 
             (panel (fixedPanel (Main.view roles (Signal.forwardTo address FormAction) current)) )

        Perm -> 
           dialogPanel "info" (info "User permissions") 
               (panel (fixedPanel (Perm.view environments operations (Signal.forwardTo address FormAction) current)))
          
    Nothing -> 
        dialogPanel "info" (info "Save new user") 
           (panel (fixedPanel (summarize (merged model))))


errorsView address {saveErrors} = 
   let
     body = (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)
   in
     dialogPanel "danger" (error "Failed to save user") (panel (panelContents body))

saveButton address =
    [button [id "Save", class "btn btn-primary", onClick address (Save saveUser) ] [text "Save  "]]

doneButton address =
    [button [id "Done", class "btn btn-primary", onClick address (Save saveUser) ] [text "Done "]]


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

saveUser: String -> Effects Action
saveUser json = 
  postJson (Http.string json) saveResponse "/users"  
    |> Task.toResult
    |> Task.map Saved
    |> Effects.task

updateUser: String -> Effects Action
updateUser json = 
  putJson (Http.string json) saveResponse "/users"  
    |> Task.toResult
    |> Task.map Saved
    |> Effects.task


environmentsKeys: Decoder (List String)
environmentsKeys=
  at ["operations"] (list string)


getOperations action = 
  getJson environmentsKeys "/users/operations" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task



