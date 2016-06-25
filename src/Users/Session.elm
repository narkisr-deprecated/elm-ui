module Users.Session exposing (..)

import Json.Decode as Json exposing (..)
import Http exposing (Error(BadResponse))
import Common.Http exposing (getJson)
import Basics.Extra exposing (never)

import Task

type alias Session = 
  {
    envs : List String,
    identity : String, 
    operations : List String,
    roles : List String,
    username : String
  }

emptySession : Session
emptySession  =
  (Session [] "" [] [] "")

session : Decoder Session
session  =
  object5 Session 
    ("envs" := list string)
    ("identity" := string )
    ("operations" := list string )
    ("roles" := list string )
    ("username" := string )

getSession msg = 
  getJson session "/sessions" 
    |> Task.toResult
    |> Task.perform never msg

logout msg =
    Http.getString "/logout" 
      |> Task.toResult
      |> Task.perform never msg

isUser: Session -> Bool
isUser {roles} =
  List.member "celestial.roles/user" roles 
