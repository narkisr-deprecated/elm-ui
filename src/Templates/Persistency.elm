module Templates.Persistency where

import Templates.Model.Common exposing (Template, emptyOpenstackDefaults, Defaults, OpenstackDefaults)
import Systems.Add.Persistency exposing (transform)
import Systems.Add.Encoders exposing (encoderOf, machineEncoder)
import Effects exposing (Effects)
import Json.Encode as E exposing (..)
import Maybe exposing (withDefault)
import Dict exposing (Dict)

openstackDefaultsEncoder : OpenstackDefaults -> Value
openstackDefaultsEncoder openstack =
  object [
     ("networks", list (List.map string (withDefault [] openstack.networks)))
  ]

defaultsEncoder : Defaults -> String -> Value
defaultsEncoder {openstack} hyp = 
  if hyp == "Openstack" then
    object [
      ("openstack" , openstackDefaultsEncoder (withDefault emptyOpenstackDefaults openstack))
    ]
  else 
    null


defaultsDictEncoder defaults hyp = 
   Dict.toList defaults |> List.map (\(k,v) -> (k, defaultsEncoder v hyp)) |> object 

encodeDefaults : Dict String Defaults -> String -> String
encodeDefaults defaults hyp =
  E.encode 0 (defaultsDictEncoder defaults hyp)

encode: Template -> String -> Value
encode ({type', machine, defaults, name, description} as template) hyp =
 object [
    ("type" , string type')
  , ("name" , string name)
  , ("description" , string description)
  , (encoderOf template hyp)
  , ("machine" , machineEncoder machine)
  , ("defaults", (defaultsDictEncoder (withDefault Dict.empty defaults) hyp))
 ] 


persistModel : (String -> Effects a) -> Template -> String -> Effects a
persistModel f template hyp =
    (f (E.encode 0 (encode template hyp)))

