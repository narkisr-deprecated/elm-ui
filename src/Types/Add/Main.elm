module Types.Add.Main where

import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.Components exposing (..)
import Common.Utils exposing (none, setEnvironments)
import Environments.List exposing (Environments, getEnvironments)
import Http exposing (Error(BadResponse))
import Maybe exposing (withDefault)


type alias Model = 
  {
    type' : String
  , description :  Maybe String
  , environment : String
  , environments : List String
  }
 
init : (Model , Effects Action)
init =
  (Model "" Nothing "" [], getEnvironments SetEnvironments)

-- Update 

type Action = 
  NoOp
   | NameInput String
   | DescriptionInput String
   | SetEnvironments (Result Http.Error Environments)

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
    _ -> 
     none model

-- View

view : Signal.Address Action -> Model -> Html
view address ({type', description} as model) =
  (Html.form [] [
       div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
           group' "Name" (inputText address NameInput " "  type')
         , group' "Description" (inputText address DescriptionInput " " (withDefault ""  description))

         ]
   ])

