module Systems.Add.General where

import Dict exposing (Dict)
import Common.Errors exposing (successHandler)
import Effects exposing (Effects, batch)
import Http exposing (Error(BadResponse))
import Admin.Core as Admin 
import Common.Components exposing (..)
import Common.Utils exposing (none)


import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type')
import Html exposing (..)

import Systems.Add.Common exposing (..)
import Environments.List exposing (Environments, Environment, getEnvironments)
import Users.Model exposing (User, getUsers)
import Types.List exposing (getTypes)
import Types.Model exposing (Type)
import Common.Components exposing (fixedPanel, asList)

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
  | SetEnvironments (Result Http.Error Environments)
  | AdminAction Admin.Action 
  | SetTypes (Result Http.Error (List Type))
  | SelectType String
  | SelectHypervisor String


init : (Model , Effects Action)
init =
  let
    (admin, adminEffects) = Admin.init
    effects = Effects.batch [
             getTypes SetTypes
           , getEnvironments SetEnvironments
           , (Effects.map AdminAction adminEffects)
    ]
  in
    (Model "" [] "" [] admin, effects)

-- Update

setEnvironments : Model -> Environments -> (Model, Effects Action)
setEnvironments model es =
  let 
     environment = Maybe.withDefault "" (List.head (Dict.keys es))
     environments = Dict.keys es
     hypervisors = (Dict.keys (Maybe.withDefault Dict.empty (Dict.get environment es)))
     hypervisor = Maybe.withDefault "" (List.head hypervisors)
  in 
    none {model | hypervisors = hypervisors, hypervisor = hypervisor}

setTypes : Model -> List Type -> (Model, Effects Action)
setTypes model types =
  let
    typesList = List.map .type' types
    firstType = Maybe.withDefault "" (List.head typesList)
  in
    ({model | types = typesList , type' = firstType}, Effects.none)

update : Action ->  Model-> (Model, Effects Action)
update action ({admin} as model) =
  case action of
    SetEnvironments result ->
     (successHandler result model (setEnvironments model) NoOp)

    AdminAction adminAction -> 
      let
        (newAdmin, effects) = Admin.update adminAction admin
      in  
        ({ model | admin = newAdmin}, Effects.map AdminAction effects)

    SelectHypervisor hypervisor -> 
      none {model | hypervisor = hypervisor}

    SetTypes result ->
      (successHandler result model (setTypes model) NoOp)

    SelectType type' -> 
      none {model | type' = type' }

    _ -> 
      none model

-- View

general address {admin, type', types, hypervisors, hypervisor} =
  div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
    (List.append
       (Admin.view (Signal.forwardTo address AdminAction) admin)
          [ group' "Type" (selector address SelectType types type')
          , group' "Hypervisor" (selector address SelectHypervisor hypervisors hypervisor)
          ]
        )

view : Signal.Address Action -> Model -> Html
view address model =
  fixedPanel (Html.form [] (asList (general address model)))




