module Users.Add.Perm where

import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (class, id, attribute, readonly, type')
import Common.FormComponents exposing (formControl, formGroup)
import Maybe exposing (withDefault)
import Form exposing (Form)
import Form.Validate exposing (..)
import Form.Input as Input
import Users.Model exposing (User, permBase)
import Form.Field as Field exposing (Field)
import Form.Infix exposing (..)

type alias Model = 
  {
    form : Form () User
  }
 
validate : Validation () User
validate =
  form2 permBase
     ("envs" := string)
     ("operations" := string)

defaults : String ->  String -> List (String, Field)
defaults env op =
  [
    ("envs", Field.Text env)
  , ("operations", Field.Text op)
  ]


init =
  Model (Form.initial [] validate)

reinit env op =
  Model (Form.initial (defaults env op) validate)
 
-- View

view envs operations address ({form} as model) =
 let 
    environment = (Form.getFieldAsStringList "envs" form)
    operation = (Form.getFieldAsStringList "operations" form)
 in
   (Html.form [] [
      div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
        formControl "Environment"  (Input.multiSelectInput envs) environment address
      , formControl "Operation"  (Input.multiSelectInput operations) operation address
      ]
    ])




