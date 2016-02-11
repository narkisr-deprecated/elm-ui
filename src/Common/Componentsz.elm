module Common.Componentsz where

import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (class, for, placeholder, attribute, type', checked, value, style, id)
import Maybe exposing (withDefault)
import Dict exposing (Dict)

errors = Dict.fromList [
    ("InvalidString", "Cannot be empty")
  ]

errorFor field =
   case field.error of
     Just error ->
       span [ class "help-block" ] [ text (withDefault "" (Dict.get (toString error) errors)) ]
     Nothing ->
       span [ class "help-block" ] []

withError field class =
  case field.error of
    Just _ ->
     class ++ " has-error"
    Nothing ->
     class

group title widget field address = 
  div [class (withError field "form-group"), id title] 
    [ label [for title, class "col-sm-3 control-label"] [(text title)]
    , div [class "col-sm-6"] [widget field address [class "form-control"]]
    , errorFor field
    ]


