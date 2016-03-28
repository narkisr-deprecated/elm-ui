module Users.Add.Main where

import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (class, id, attribute, readonly, type')
import Common.FormComponents exposing (formControl, formGroup)
import Maybe exposing (withDefault)
import Form exposing (Form)
import Form.Validate exposing (..)
import Form.Input as Input
import Users.Model exposing (User, userBase)
import Form.Field as Field exposing (Field)
import Form.Infix exposing (..)

type alias Model = 
  {
    form : Form () User
  }
 
validate : Validation () User
validate =
  form3 userBase
     ("username" := string)
     ("password" := string)
     ("roles" := string)
 
defaults : String ->  List (String, Field)
defaults role =
  [ ("role", Field.Text role) ]

init role =
  Model (Form.initial (defaults role) validate)
 
-- View

view roles address ({form} as model) =
  let 
    role = (Form.getFieldAsString "role" form)
    description = (Form.getFieldAsString "description" form)
  in 
   (Html.form [] [
      div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
        -- typeField address model
        formControl "Description" Input.textInput description address
      , formControl "Roles"  (Input.selectInput []) role address
      ]
    ])




