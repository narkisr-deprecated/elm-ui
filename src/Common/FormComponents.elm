module Common.FormComponents exposing (..)


import Html exposing (..)
import Html.Attributes exposing (class, for, placeholder, attribute, type', checked, value, style, id)
import Maybe exposing (withDefault)
import Dict exposing (Dict)

errors = Dict.fromList [
      ("InvalidString", "Cannot be empty")
    , ("Empty", "Cannot be empty")
  ]

errorFor field =
   case field.error of
     Just error ->
       span [ class "help-block" ] [ text (withDefault "Error message missing!" (Dict.get (toString error) errors)) ]
     Nothing ->
       span [ class "help-block" ] []

withError field class =
  case field.error of
    Just _ ->
     class ++ " has-error"

    Nothing ->
     class

formControl title widget field address  = 
  formGroup title widget field address [class "form-control"]

formGroup title widget field address attrs = 
  div [class (withError field "form-group"), id title] 
    [ label [for title, class "col-sm-3 control-label"] [
       (text title)
      ]
    , div [class "col-sm-6"] [
       widget field address attrs
      ]
    , errorFor field
    ]
