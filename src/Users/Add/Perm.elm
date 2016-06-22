module Users.Add.Perm exposing (..)


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
     ("envs" := stringList)
     ("operations" := stringList)

init =
  Model (Form.initial [] validate)

-- View

view envs operations ({form} as model) =
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




