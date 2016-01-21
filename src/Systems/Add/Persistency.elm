module Systems.Add.Persistency where

import Effects exposing (Effects, batch)
import Systems.Add.Encoders exposing (..)
import Json.Encode as E
import Dict exposing (Dict)
import String
import Focus exposing (Focus, set, (=>), create)
import Common.Utils exposing (none)
import Maybe exposing (withDefault)
import Systems.Model.AWS exposing (emptyAws)
import Systems.Model.GCE exposing (emptyGce)
import Systems.Model.Digital exposing (emptyDigital)
import Systems.Model.Openstack exposing (emptyOpenstack)
import Systems.Model.Physical exposing (emptyPhysical)
import Systems.Model.Common exposing (System, emptyMachine)

encodeAws : System -> E.Value
encodeAws ({owner, env, type', aws, machine} as model) =
 E.object [
    ("type" , E.string type')
  , ("owner" , E.string owner)
  , ("env" , E.string env)
  , ("aws", awsEncoder (withDefault emptyAws aws))
  , ("machine" , machineEncoder machine)
 ]

encodeGce : System -> E.Value
encodeGce {owner, env, type', gce, machine} =
 E.object [
    ("type" , E.string type')
  , ("owner" , E.string owner)
  , ("env" , E.string env)
  , ("gce" , gceEncoder (withDefault emptyGce gce))
  , ("machine" , machineEncoder machine)
 ]

encodeDigital : System -> E.Value
encodeDigital {owner, env, type', digital, machine} =
 E.object [
    ("type" , E.string type')
  , ("owner" , E.string owner)
  , ("env" , E.string env)
  , ("digital-ocean" , digitalEncoder (withDefault emptyDigital digital))
  , ("machine" , machineEncoder machine)
 ]

encodePhysical : System -> E.Value
encodePhysical {owner, env, type', physical, machine} =
 E.object [
    ("type" , E.string type')
  , ("owner" , E.string owner)
  , ("env" , E.string env)
  , ("physical" , physicalEncoder (withDefault emptyPhysical physical))
  , ("machine" , machineEncoder machine)
 ]

encodeOpenstack : System -> E.Value
encodeOpenstack {owner, env, type', openstack, machine} =
 E.object [
    ("type" , E.string type')
  , ("owner" , E.string owner)
  , ("env" , E.string env)
  , ("openstack" , openstackEncoder (withDefault emptyOpenstack openstack))
  , ("machine" , machineEncoder machine)
 ]

aws : Focus { r | aws :a } a
aws =
   create .aws (\f r -> { r | aws = f r.aws })

openstack : Focus { r | openstack :a } a
openstack =
   create .openstack (\f r -> { r | openstack = f r.openstack })

blockDevices : Focus { r | blockDevices :a } a
blockDevices =
   create .blockDevices (\f r -> { r | blockDevices = f r.blockDevices })

volumes : Focus { r | volumes :a } a
volumes =
   create .volumes (\f r -> { r | volumes = f r.volumes })

addDevice : Maybe (List {r | device : String}) -> Maybe (List {r | device : String})
addDevice vs = 
  Just (List.map (\({device} as volume) -> {volume | device = "/dev/"++device}) (withDefault [] vs))

encoders =  Dict.fromList [
    ("AWS", encodeAws)
  , ("GCE", encodeGce)
  , ("Digital", encodeDigital)
  , ("Openstack", encodeOpenstack)
  , ("Physical", encodePhysical)
  ]

transformers =  Dict.fromList [
    ("AWS", ((Focus.update (aws => blockDevices) addDevice) <<
             (Focus.update (aws => volumes) addDevice)))
  , ("Openstack", Focus.update (openstack => volumes) addDevice)
  ]


persistModel : (String -> Effects a) -> System -> String -> Effects a
persistModel f system stage =
  case (Dict.get stage encoders) of
     Just encode -> 
        case (Dict.get stage transformers) of
          Just transform -> 
            (f (E.encode 0 (encode system)))

          Nothing -> 
            (f (E.encode 0 (encode system)))

     Nothing -> 
        Effects.none

