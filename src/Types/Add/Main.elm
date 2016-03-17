module Types.Add.Main where

import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.FormComponents exposing (formControl)
import Maybe exposing (withDefault)
import Form exposing (Form)
import Form.Validate as Validate exposing (..)
import Form.Input as Input
import Types.Model exposing (Type, typeBase)
import Form.Field as Field exposing (Field)
import Form.Infix exposing (..)

type alias Model = 
  {
    form : Form () Type
  }
 
validate : Validation () Type
validate =
  form3 typeBase
     ("type" := string)
     ("description" := string)
     ("environment" := string)
 
defaults : String ->  List (String, Field)
defaults env =
  [ ("environment", Field.Text env) ]

init env =
  Model (Form.initial (defaults env) validate)
 
editDefaults: String -> Type ->  List (String, Field)
editDefaults env {type', description, puppetStd} =
    [ ("environment", Field.Text env)
    , ("description", Field.Text (withDefault "" description))
    , ("type", Field.Text type')
    ]

reinit env type' =
  Model (Form.initial (editDefaults env type') validate)

-- View

view environments address ({form} as model) =
  let 
    type' = (Form.getFieldAsString "type" form)
    description = (Form.getFieldAsString "description" form)
    environment = (Form.getFieldAsString "environment" form)
  in 
   (Html.form [] [
      div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
        formControl "Type" Input.textInput type' address
      , formControl "Description" Input.textInput description address 
      , formControl "Environment"  (Input.selectInput environments) environment address
      ]
    ])




