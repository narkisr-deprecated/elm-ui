module Users.Model where

import Effects exposing (Effects)
import Html exposing (..)

import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)

import Effects exposing (Effects)
import Task

-- Model

type alias User = 
  {
    username : String
  , operations : List String
  , roles : List String
  , envs : List String 
  }

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
  getJson usersList "/users" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task


