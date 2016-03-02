module Types.Model where

import Json.Decode as Json exposing (..)
import Dict exposing (Dict)
import String

type Options = 
  BoolOption Bool 
    | StringOption String


type alias Module = 
  {
    name : String 
  , src : String 
  , options : Maybe (Dict String Options)
  }

type alias PuppetStd = 
  {
    module' : Module
  , args : List String
  , classes : Dict String (Dict String Options)
  }


type alias Type = 
  {
    type' : String 
  , description : Maybe String
  , puppetStd : Dict String PuppetStd
  }

option = 
  (oneOf [map BoolOption bool, map StringOption string])

module' : Decoder Module
module' = 
  object3 Module
   ("name" := string)
   ("src" := string)
   (maybe ("options" := dict option))

puppetStd : Decoder PuppetStd
puppetStd =
  object3 PuppetStd
     ("module" :=  module')
     ("args" := list string)
     ("classes" := dict (dict option))

type': Decoder Type
type' = 
  object3 Type
    ("type" := string)
    (maybe ("description" := string))
    ("puppet-std" := dict puppetStd)


emptyType = 
  Type "" Nothing Dict.empty

emptyModule = 
  Module "" "" Nothing

emptyPuppet =
  PuppetStd emptyModule [] Dict.empty

typeBase type' description environment = 
  Type type' (Just description) (Dict.fromList [(environment, emptyPuppet)])

puppetBase name src unsecure args = 
  let
    module' = Module name src (Just (Dict.fromList [("unsecure", BoolOption unsecure)]))
    puppet = PuppetStd module' (String.split args " ") Dict.empty
  in
    { emptyType | puppetStd = Dict.fromList [("--", puppet)] }
