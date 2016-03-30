module Users.Model where

import Effects exposing (Effects)
import Html exposing (..)

import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Dict exposing (Dict)
import String

import Effects exposing (Effects)
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

permBase : String -> String -> User
permBase envs operations =
  User "" Nothing [] [] []

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

getUsers action = 
  getJson usersList "/users" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task

rolesList : Decoder (Dict String String)
rolesList =
  at ["roles"] (dict string)

getRoles action = 
  getJson rolesList "/users/roles" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task


