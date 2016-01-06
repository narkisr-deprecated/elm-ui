module Types.Add where

import Html exposing (..)
import Bootstrap.Html exposing (..)
import Types.Model exposing (..)
import Dict exposing (Dict)
import Effects exposing (Effects)

type alias Model = 
  {
    description : String
  , type' : String
  , env : String
  , puppetStd : Dict String PuppetStd
  }

init : (Model , Effects Action)
init =
  (Model "" "" "" Dict.empty, Effects.none)

type Action = 
  NoOp

update : Action ->  Model -> (Model , Effects Action)
update action model =
  (model, Effects.none)

view : Signal.Address Action -> Model -> List Html
view address model =
  [div  [] [text "not implemented" ]]
