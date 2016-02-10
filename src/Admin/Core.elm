module Admin.Core where

import Effects exposing (Effects, batch)
import Html exposing (..)
import Common.Redirect exposing (successHandler)
import Environments.List exposing (Environments, Environment, getEnvironments)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none)
import Users.List exposing (User, getUsers)
import Common.Components exposing (..)
import Dict


type alias Model = 
  {
    environments : List String
  , environment : String
  , rawEnvironments : Environments
  , owners : List String
  , owner : String
  }
 
init : (Model , Effects Action)
init =
  (Model [] "" Dict.empty [] "", batch [getUsers SetOwners,  getEnvironments SetEnvironments])

-- Update 

type Action = 
  SetEnvironments (Result Http.Error Environments)
    | SetOwners (Result Http.Error (List User))
    | SelectOwner String
    | SelectEnvironment String
    | NoOp

setOwners : Model -> List User -> (Model, Effects Action)
setOwners model owners =
  let
    users = List.map .username owners
    user = Maybe.withDefault "" (List.head users)
  in
   none {model | owners = users, owner = user}

setEnvironments : Model -> Environments -> (Model, Effects Action)
setEnvironments model es =
  let 
    environment = (Maybe.withDefault "" (List.head (Dict.keys es)))
  in 
    none {model | environments = Dict.keys es, environment = environment, rawEnvironments = es}



update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   SetEnvironments result ->
       (successHandler result model (setEnvironments model) NoOp)

   SelectEnvironment environment -> 
       none {model | environment = environment}

   SetOwners result ->
      (successHandler result model (setOwners model) NoOp)

   SelectOwner owner -> 
      none {model | owner = owner}

   NoOp -> 
      (model, Effects.none)


view : Signal.Address Action -> Model -> List Html
view address ({environments, environment, owner, owners} as model) =
  [ 
    group' "Environment" (selector address SelectEnvironment environments environment)
  , group' "Owner" (selector address SelectOwner owners owner)
  ]
