module Types.List where

import Html exposing (..)
import Effects exposing (Effects)
import Dict exposing (Dict)

import Json.Decode as Json exposing (..)
import Http exposing (Error(BadResponse))
import Effects exposing (Effects)
import Task


type alias Module = 
  { name : String , src : String }

type alias PuppetStd = 
  { module' : Module }

type alias Type = 
  { type' : String, puppetStd : Dict String PuppetStd}

type alias Model = 
  { types : List Type} 

init : (Model , Effects Action)
init =
  ({ types = []} , Effects.none)

type Action = 
  Load

update : Action ->  Model-> (Model , Effects Action)
update address model =
  (model, Effects.none)

view : Signal.Address Action -> Model -> List Html
view address model =
  [div  [] [text "types"]]

-- Decoding

module' : Decoder Module
module' = 
  object2 Module
   ("name" := string)
   ("src" := string)

puppetStd : Decoder PuppetStd
puppetStd =
  object1 PuppetStd
  ("module" :=  module')

type': Decoder Type
type' = 
  object2 Type
    ("type" := string)
    ("puppet-std" := dict puppetStd)

typesList : Decoder (List Type)
typesList =
   at ["types"] (list type')

-- Effects
getTypes action = 
  Http.get typesList "/types" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task


