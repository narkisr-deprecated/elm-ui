module Users.List where

import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Common.Redirect exposing (successHandler)

import Effects exposing (Effects)
import Task

-- Model

type alias User = 
  { username : String, operations : List String, roles : List String, envs : List String }

-- Decoding

user : Decoder User
user = 
  object4 User
    ("username" := string)
    ("operations" := list string)
    ("roles" := list string)
    ("envs" := list string)

usersList : Decoder (List User)
usersList =
  list user

-- Effects

getUsers action = 
  Http.get usersList "/users" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task


