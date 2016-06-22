module Types.Add.Puppet exposing (..)

import Common.Model exposing (Options(BoolOption))
import Types.Model exposing (PuppetStd, emptyPuppet)

import Html exposing (..)
import Common.Utils exposing (none, defaultEmpty)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.Components exposing (group')
import Common.FormComponents exposing (formControl, formGroup)
import Form exposing (Form)
import Form.Validate exposing (..)
import Form.Input as Input
import Types.Model exposing (Type, puppetBase, emptyPuppet)
import Maybe exposing (withDefault)
import Form.Field as Field exposing (Field)
import Form.Infix exposing (..)
import Dict exposing (Dict)
import String

type alias Model = 
  {
    form : Form () Type
  }
 
validate : Validation () Type
validate =
  form4 puppetBase
     ("name" := string)
     ("source" := string)
     ("unsecure" := bool)
     ("arguments" := string)
 
init : Model
init =
  Model (Form.initial [] validate)

defaultBool option = 
  case (withDefault (BoolOption False) option) of 
    BoolOption bool -> 
      bool

    _ -> 
      False

editDefaults: String -> Type -> List (String, Field)
editDefaults env ({puppetStd} as type') =
  let
    ({module'} as std) = withDefault emptyPuppet (Dict.get env puppetStd)
    unsecure = defaultBool (Dict.get "unsecure" (withDefault Dict.empty module'.options))
  in 
    [
      ("name", Field.Text module'.name)
    , ("source", Field.Text module'.src)
    , ("unsecure", Field.Check unsecure)
    , ("arguments", Field.Text (String.join " " std.args))
    ]

reinit: String -> Type -> Model
reinit env type' =
  Model (Form.initial (editDefaults env type') validate)


view check ({form} as model) =
 let 
    name = (Form.getFieldAsString "name" form)
    source = (Form.getFieldAsString "source" form)
    arguments = (Form.getFieldAsString "arguments" form)
    unsecure = (Form.getFieldAsBool "unsecure" form)
 in 
   (Html.form [] [
     div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
        formControl "Name" Input.textInput name 
      , formControl "Source" Input.textInput source
      , formGroup "Unsecure" Input.checkboxInput unsecure []
      , formControl "Arguments" Input.textInput arguments 
      , group' "Edit classes" check
      , div [ id "jsoneditor"
          , style [("width", "50%"), ("height", "400px"), ("margin-left", "25%")]] []

      ]
   ])
