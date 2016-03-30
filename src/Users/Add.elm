module Users.Add where


import Html exposing (..)
import Bootstrap.Html exposing (..)
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
import Common.Model exposing (Options)

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
  , roles : Dict String String
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
  in
    (Model wizard errors False Dict.empty, getRoles SetRoles)

type Action = 
   ErrorsView Errors.Action
    | WizardAction Wizard.Action
    | FormAction Form.Action
    | SetRoles (Result Http.Error (Dict String String))
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
  in
    none { model | roles = roles, wizard = { wizard | step = Just mainStep }}

update : Action ->  Model -> (Model , Effects Action)
update action ({wizard} as model) =
  case action of 
    Next -> 
      Debug.log "" (update (WizardAction Wizard.Next) model)

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

    Save f -> 
      none model
      -- (model, persistType f (merged model))

    Saved result -> 
       errorsHandler result model NoOp

    _ -> 
      (none model)

currentView : Signal.Address Action -> Model -> List Html
currentView address ({wizard, roles} as model) =
  case wizard.step of 
    Just ({value} as current) ->
      case value of 
        Main -> 
          let 
             pairs = List.map (\(f,s) -> (s, f)) (Dict.toList roles)
          in
            dialogPanel "info" (info "Add a new User") 
             (panel (fixedPanel (Main.view pairs (Signal.forwardTo address FormAction) current)) )

        Perm -> 
           dialogPanel "info" (info "User permissions") 
               (panel (fixedPanel (Perm.view [] [] (Signal.forwardTo address FormAction) current)))
          
    Nothing -> 
        dialogPanel "info" (info "Save new user") 
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



