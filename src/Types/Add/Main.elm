module Types.Add.Main where

import Effects exposing (Effects)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.Components exposing (..)
import Maybe exposing (withDefault)


type alias Model = 
  {
    type' : String
  , description :  Maybe String
  }
 
init : (Model , Effects Action)
init =
  (Model "" Nothing, Effects.none)

-- Update 

type Action = 
  NoOp
   | NameInput String
   | DescriptionInput String

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   _ -> 
     (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> Html
view address ({type', description} as model) =
  (Html.form [] [
       div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
           group' "Name" (inputText address NameInput " "  type')
         , group' "Description" (inputText address DescriptionInput " " (withDefault ""  description))

         ]
   ])

