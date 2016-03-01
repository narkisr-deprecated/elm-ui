module Types.Add.Puppet where

import Types.Model exposing (PuppetStd, emptyPuppet)
import Effects exposing (Effects)
import Html exposing (..)
import Common.Utils exposing (none)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.Components exposing (group')
import Common.FormComponents exposing (formControl, formGroup)
import Form exposing (Form)
import Form.Validate as Validate exposing (..)
import Form.Input as Input
import Types.Add.Common as Common exposing (Type(Puppet))



type alias Model = 
  {
    form : Form () Common.Type
  }
 
validate : Validation () Type
validate =
  form4 Puppet
     ("name" := string)
     ("source" := string)
     ("unsecure" := bool)
     ("arguments" := string)
 
init : Model
init =
  Model (Form.initial [] validate)

view check address ({form} as model) =
 let 
    name = (Form.getFieldAsString "name" form)
    source = (Form.getFieldAsString "source" form)
    arguments = (Form.getFieldAsString "arguments" form)
    unsecure = (Form.getFieldAsBool "unsecure" form)
  in 
   (Html.form [] [
     div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
        formControl "Name" Input.textInput name address
      , formControl "Source" Input.textInput source address
      , formGroup "Unsecure" Input.checkboxInput unsecure address []
      , formControl "Arguments" Input.textInput arguments address
      , group' "Edit classes" check
      , div [ id "jsoneditor"
          , style [("width", "50%"), ("height", "400px"), ("margin-left", "25%")]] []

      ]
   ])
