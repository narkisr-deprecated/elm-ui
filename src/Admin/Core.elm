module Admin.Core exposing (..)

import Platform.Cmd exposing (batch)
import Html exposing (..)
import Common.Errors exposing (successHandler)
import Environments.List exposing (Environments, Environment, getEnvironments)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none)
import Users.Model exposing (User, getUsers)
import Common.Components exposing (..)
import Users.Session exposing (isUser, getSession, Session)
import Dict


type alias Model = 
  {
    environments : List String
  , environment : String
  , rawEnvironments : Environments
  , owners : List String
  , owner : String
  }
 
partialAdmin : String -> String -> Model
partialAdmin owner environment =
    Model [] environment Dict.empty [] owner

init : (Model , Cmd Msg)
init =
  (Model [] "" Dict.empty [] "", batch [ getEnvironments SetEnvironments, getSession LoadSession])

-- Update 

type Msg = 
  SetEnvironments (Result Http.Error Environments)
    | SetOwners (Result Http.Error (List User))
    | SelectOwner String
    | SelectEnvironment String
    | LoadSession (Result Http.Error Session)
    | NoOp

setOwners : Model -> List User -> (Model, Cmd Msg)
setOwners model owners =
  let
    users = List.map .username owners
    user = Maybe.withDefault "" (List.head users)
  in
    none {model | owners = users, owner = user}

setEnvironments : Model -> Environments -> (Model, Cmd Msg)
setEnvironments model es =
  let 
    environment = (Maybe.withDefault "" (List.head (Dict.keys es)))
  in 
    none {model | environments = Dict.keys es, environment = environment, rawEnvironments = es}

setSession model ({username} as session) = 
  if isUser session then
     none {model | owner = username } 
  else 
    (model, getUsers SetOwners)

update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  case msg of 
   SetEnvironments result ->
     (successHandler result model (setEnvironments model) NoOp)

   SelectEnvironment environment -> 
      none {model | environment = environment}

   SetOwners result ->
     (successHandler result model (setOwners model) NoOp)

   SelectOwner owner -> 
     none {model | owner = owner}

   LoadSession result -> 
      (successHandler result model (setSession model) NoOp)

   NoOp -> 
      none model


ownersList {owner, owners} = 
  if List.isEmpty owners then 
    [owner]
  else 
    owners

view : Model -> List (Html Msg)
view ({environments, environment, owner} as model) =
  [ 
    group' "Environment" (selector SelectEnvironment environments environment)
  , group' "Owner" (selector SelectOwner (ownersList model) owner)
  ]
