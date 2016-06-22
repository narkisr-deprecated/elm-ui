module Systems.Add.General exposing (..)

import Dict exposing (Dict)
import Common.Errors exposing (successHandler)
import Platform.Cmd exposing (batch)
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

type Msg = 
  NoOp
  | SetEnvironments (Result Http.Error Environments)
  | AdminMsg Admin.Msg 
  | SetTypes (Result Http.Error (List Type))
  | SelectType String
  | SelectHypervisor String


init : (Model , Cmd Msg)
init =
  let
    (admin, adminEffects) = Admin.init
    effects = Effects.batch [
             getTypes SetTypes
           , getEnvironments SetEnvironments
           , (Effects.map AdminMsg adminEffects)
    ]
  in
    (Model "" [] "" [] admin, effects)

-- Update

setEnvironments : Model -> Environments -> (Model, Effects Msg)
setEnvironments model es =
  let 
     environment = Maybe.withDefault "" (List.head (Dict.keys es))
     environments = Dict.keys es
     hypervisors = (Dict.keys (Maybe.withDefault Dict.empty (Dict.get environment es)))
     hypervisor = Maybe.withDefault "" (List.head hypervisors)
  in 
    none {model | hypervisors = hypervisors, hypervisor = hypervisor}

setTypes : Model -> List Type -> (Model, Effects Msg)
setTypes model types =
  let
    typesList = List.map .type' types
    firstType = Maybe.withDefault "" (List.head typesList)
  in
    ({model | types = typesList , type' = firstType}, Effects.none)

update : Msg ->  Model-> (Model, Effects Msg)
update msg ({admin} as model) =
  case msg of
    SetEnvironments result ->
     (successHandler result model (setEnvironments model) NoOp)

    AdminMsg adminMsg -> 
      let
        (newAdmin, effects) = Admin.update adminMsg admin
      in  
        ({ model | admin = newAdmin}, Effects.map AdminMsg effects)

    SelectHypervisor hypervisor -> 
      none {model | hypervisor = hypervisor}

    SetTypes result ->
      (successHandler result model (setTypes model) NoOp)

    SelectType type' -> 
      none {model | type' = type' }

    _ -> 
      none model

-- View

general {admin, type', types, hypervisors, hypervisor} =
  div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
    (List.append
       (Admin.view (Signal.forwardTo AdminMsg) admin)
          [ group' "Type" (selector SelectType types type')
          , group' "Hypervisor" (selector SelectHypervisor hypervisors hypervisor)
          ]
        )

view : Model -> Html Msg
view model =
  fixedPanel (Html.form [] (asList (general model)))




