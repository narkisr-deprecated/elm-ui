module Systems.Add.General where

import Dict exposing (Dict)
import Common.Redirect exposing (successHandler)
import Effects exposing (Effects, batch)
import Http exposing (Error(BadResponse))
import Admin.Core as Admin 


import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type')
import Html exposing (..)

import Systems.Add.Common exposing (..)
import Environments.List exposing (Environments, Environment, getEnvironments)
import Users.List exposing (User, getUsers)
import Types.List exposing (Type, getTypes)

import Common.Components exposing (panelContents)

import Debug

-- Model

type alias Model = 
  { 
    type' : String
  , types : List String
  , hypervisor : String
  , hypervisors : List String
  , admin : Admin.Model
  }

type Action = 
  NoOp
  | AdminAction Admin.Action 
  | SetTypes (Result Http.Error (List Type))
  | SelectType String
  | SelectHypervisor String


init : (Model , Effects Action)
init =
  let
    (admin, effects) = Admin.init
    loadEffects = [getTypes SetTypes, (Effects.map AdminAction effects)]
  in
   (Model "" [] "" [] admin, batch loadEffects)

-- Update

updateHypervisors : Model -> Environments -> String -> Model
updateHypervisors model es environment = 
  let 
    hypervisors = (Dict.keys (Maybe.withDefault Dict.empty (Dict.get environment es)))
    hypervisor = Maybe.withDefault "" (List.head hypervisors)
  in 
    {model | hypervisors = hypervisors, hypervisor = hypervisor}

withoutEffects : (a , Effects action) -> a 
withoutEffects (model,_) =
  model

setTypes : Model -> List Type -> (Model, Effects Action)
setTypes model types =
  let
    typesList = List.map .type' types
    firstType = Maybe.withDefault "" (List.head typesList)
  in
    ({model | types = typesList , type' = firstType}, Effects.none)

update : Action ->  Model-> Model
update action ({admin} as model) =
  case action of
    AdminAction action -> 
      let
        (newAdmin, _) = Admin.update action admin
      in  
        (updateHypervisors { model | admin = newAdmin} newAdmin.rawEnvironments newAdmin.environment)

    SelectHypervisor hypervisor -> 
      {model | hypervisor = hypervisor}

    SetTypes result ->
      withoutEffects (successHandler result model (setTypes model) NoOp)

    SelectType type' -> 
      {model | type' = type' }

    _ -> 
      model

-- View

view : Signal.Address Action -> Model -> List Html
view address ({admin} as model) =
  panelContents "General Information" 
    (Html.form [] [
      div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       (List.append
         (Admin.view (Signal.forwardTo address AdminAction) admin)
         [ group' "Type" (selector address SelectType model.types model.type')
         , group' "Hypervisor" (selector address SelectHypervisor model.hypervisors model.hypervisor)]
         )

    ])


