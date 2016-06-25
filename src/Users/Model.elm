module Users.Model exposing (..)


import Html exposing (..)
import Basics.Extra exposing (never)

import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Dict exposing (Dict)
import String


import Task

-- Model

type alias User = 
  {
    username : String
  , password : Maybe String
  , operations : List String
  , roles : List String
  , envs : List String 
  }

emptyUser : User
emptyUser  =
  User "" Nothing [] [] [] 

userBase name password role =
  User name (Just password) [] [role] []

permBase : List String -> List String -> User
permBase envs operations =
  User "" Nothing operations [] envs

-- Decoding

user : Decoder User
user = 
  object5 User
    ("username" := string)
    (maybe ("password" := string))
    ("operations" := list string)
    ("roles" := list string)
    ("envs" := list string)

usersList : Decoder (List User)
usersList =
  list user

-- Effects

getUsers msg = 
  getJson usersList "/users" 
    |> Task.toResult
    |> Task.perform never msg

rolesList : Decoder (Dict String String)
rolesList =
  at ["roles"] (dict string)

getRoles msg = 
  getJson rolesList "/users/roles" 
    |> Task.toResult
    |> Task.perform never msg


