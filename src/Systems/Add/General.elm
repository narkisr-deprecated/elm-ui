module Systems.Add.General where

import Dict exposing (Dict)
import Common.Redirect exposing (successHandler)
import Effects exposing (Effects, batch)
import Http exposing (Error(BadResponse))


import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type')
import Html exposing (..)

import Systems.Add.Common exposing (..)
import Environments.List exposing (Environments, Environment, getEnvironments)
import Users.List exposing (User, getUsers)
import Types.List exposing (Type, getTypes)

import Debug

-- Model

type alias Model = 
  { owners : List String
  , owner : String
  , types : List String
  , type' : String
  , environments : List String
  , environment : String 
  , hypervisors : List String
  , hypervisor : String
  , rawEnvironments : Environments
  }

type Action = 
  NoOp
  | SetOwners (Result Http.Error (List User))
  | SelectOwner String
  | SetTypes (Result Http.Error (List Type))
  | SelectType String
  | SetEnvironments (Result Http.Error Environments)
  | SelectEnvironment String
  | SelectHypervisor String


init : (Model , Effects Action)
init =
  let
    loadEffects = [getUsers SetOwners, getTypes SetTypes, getEnvironments SetEnvironments]
  in
   (Model [] "" [] "" [] "" [] "" Dict.empty, batch loadEffects)

-- Update

updateHypervisors : Model -> Environments -> String -> Model
updateHypervisors model es environment = 
  let 
    hypervisors = (Dict.keys (Maybe.withDefault Dict.empty (Dict.get environment es)))
    hypervisor = Maybe.withDefault "" (List.head hypervisors)
  in 
    {model | hypervisors = hypervisors, hypervisor = hypervisor}

setEnvironments : Model -> Environments -> (Model, Effects Action)
setEnvironments model es =
  let 
    environment = (Maybe.withDefault "" (List.head (Dict.keys es)))
    withEnvironment = {model | environments = Dict.keys es, environment = environment, rawEnvironments = es}
    updated = (updateHypervisors withEnvironment es environment)
  in 
    (updated, Effects.none)


withoutEffects : (Model, Effects action) -> Model
withoutEffects (model,_) =
  model
 

setTypes : Model -> List Type -> (Model, Effects Action)
setTypes model types =
  let
    typesList = List.map .type' types
    firstType = Maybe.withDefault "" (List.head typesList)
  in
    ({model | types = typesList , type' = firstType}, Effects.none)

setOwners : Model -> List User -> (Model, Effects Action)
setOwners model owners =
  let
    users = List.map .username owners
    user = Maybe.withDefault "" (List.head users)
  in
  ({model | owners = users, owner = user}, Effects.none)

update : Action ->  Model-> Model
update action model =
  case action of
    SetOwners result ->
      withoutEffects (successHandler result model (setOwners model) NoOp)

    SelectOwner owner -> 
      {model | owner = owner}

    SetEnvironments result ->
       withoutEffects (successHandler result model (setEnvironments model) NoOp)

    SelectEnvironment environment -> 
      updateHypervisors {model | environment = environment} model.rawEnvironments environment

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
view address model =
  panelContents "General Information" 
    (Html.form [] [
      div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ group' "Owner" (selector address SelectOwner model.owners model.owner)
       , group' "Type" (selector address SelectType model.types model.type')
       , group' "Environment" (selector address SelectEnvironment model.environments model.environment)
       , group' "Hypervisor" (selector address SelectHypervisor model.hypervisors model.hypervisor)]
    ])


