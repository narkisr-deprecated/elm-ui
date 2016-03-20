module Types.Add.Main where

import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (class, id, attribute, readonly, type')
import Common.FormComponents exposing (formControl, formGroup)
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
    [ 
      ("type", Field.Text type')
    , ("description", Field.Text (withDefault "" description))
    , ("environment", Field.Text env)
    ]

reinit env type' =
  Model (Form.initial (editDefaults env type') validate)

-- View
typeField address {form} = 
  let
    ({isDirty, value, isChanged} as type') = Form.getFieldAsString "type" form
    inEdit = (not isDirty && value /= Nothing && not isChanged )
  in
    formGroup "Type" Input.textInput type' address [class "form-control", readonly inEdit]

view environments address ({form} as model) =
  let 
    environment = (Form.getFieldAsString "environment" form)
    description = (Form.getFieldAsString "description" form)
  in 
   (Html.form [] [
      div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
        typeField address model
      , formControl "Description" Input.textInput description address
      , formControl "Environment"  (Input.selectInput environments) environment address
      ]
    ])




