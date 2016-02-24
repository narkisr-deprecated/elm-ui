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
import Common.Wizard as Wizard

import Types.Model exposing (Type, emptyType)
import Types.Add.Puppet as Puppet
import Types.Add.Main as Main

type alias Model = 
  {
    stage : Stage
  , puppet : Puppet.Model
  , main : Main.Model
  , saveErrors : Errors.Model
  }

init : (Model , Effects Action)
init =
  let
    (errors, _ ) = Errors.init
    (main, mainEffects ) = Main.init
    (puppet, puppetEffects ) = Puppet.init
    effects = [
    ]
  in
    (Model Main puppet main errors, Effects.batch effects)

type Stage = 
    Main
     | Puppet

type Action = 
   ErrorsView Errors.Action
    | SetClasses String
    | PuppetAction Puppet.Action 
    | MainAction Main.Action 
    | Back
    | Save
    | Done
    | Cancel
    | Next
    | NoOp

update : Action ->  Model -> (Model , Effects Action)
update action model =
  case action of 

    _ -> 
      none model

currentView : Signal.Address Action -> Model -> List Html
currentView address ({stage, puppet, main} as model) =
  case stage of 
    Puppet -> 
      infoCallout address (info "Puppet standalone") (panel (panelContents (Puppet.view (Signal.forwardTo address PuppetAction) puppet))) Back Save

    Main -> 
      infoCallout address (info "Add a new Type") (panel (panelContents (Main.view (Signal.forwardTo address MainAction) main))) Cancel Next
      


view : Signal.Address Action -> Model -> List Html
view address ({saveErrors} as model) =
  let
    errorsView = (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)
  in
    if Errors.hasErrors saveErrors then
      dangerCallout address (error "Failed to save type") (panel (panelContents errorsView)) Cancel Done
    else 
       (currentView address model)
      

