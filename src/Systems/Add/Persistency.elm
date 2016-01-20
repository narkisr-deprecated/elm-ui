module Systems.Add.Persistency where

import Systems.Add.General as General exposing (..)
import Systems.Add.AWS as AWS exposing (..)
import Systems.Add.Physical as Physical exposing (..)
import Systems.Add.Openstack as Openstack exposing (..)
import Systems.Add.GCE as GCE exposing (..)
import Systems.Add.Digital as Digital exposing (..)
import Systems.Add.Encoders exposing (..)
import Json.Encode as E
import Dict exposing (Dict)
import String
import Focus exposing (Focus, set, (=>), create)
import Common.Utils exposing (none)
import Maybe exposing (withDefault)

encoder key model =
 let 
   encoders = Dict.fromList [
       ("aws" , (\ ({awsModel}) -> awsEncoder awsModel))
     , ("gce" , (\ ({gceModel}) -> gceEncoder gceModel))
   ]
 in
  case (Dict.get key encoders) of
    Just  enc -> 
       (key, (enc model))
    Nothing -> 
       (key, E.null)
   

encodeAwsModel ({awsModel, general} as model) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , (encoder "aws" model)
  , ("machine" , machineEncoder awsModel.machine)
 ]

encodeGceModel ({gceModel, general} as model) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , (encoder "gce" model)
  , ("machine" , machineEncoder gceModel.machine)
 ]

encodeDigitalModel ({digitalModel, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("digital-ocean" , digitalEncoder digitalModel)
  , ("machine" , machineEncoder digitalModel.machine)
 ]

encodePhysicalModel ({physicalModel, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("physical" , physicalEncoder physicalModel)
  , ("machine" , machineEncoder physicalModel.machine)
 ]

encodeOpenstackModel ({openstackModel, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("openstack" , openstackEncoder openstackModel)
  , ("machine" , machineEncoder openstackModel.machine)
 ]

encoders =  Dict.fromList [
    ("AWS", encodeAwsModel)
  , ("GCE", encodeGceModel)
  , ("Digital", encodeDigitalModel)
  , ("Openstack", encodeOpenstackModel)
  , ("Physical", encodePhysicalModel)
  ]

aws : Focus { r | aws :a } a
aws =
   create .aws (\f r -> { r | aws = f r.aws })

awsModel : Focus { r | awsModel :a } a
awsModel =
   create .awsModel (\f r -> { r | awsModel = f r.awsModel })

openstack : Focus { r | openstack :a } a
openstack =
   create .openstack (\f r -> { r | openstack= f r.openstack })

openstackModel : Focus { r | openstackModel :a } a
openstackModel =
   create .openstackModel (\f r -> { r | openstackModel = f r.openstackModel })

blockDevices : Focus { r | blockDevices :a } a
blockDevices =
   create .blockDevices (\f r -> { r | blockDevices = f r.blockDevices })

volumes : Focus { r | volumes :a } a
volumes =
   create .volumes (\f r -> { r | volumes = f r.volumes })

addDevice : Maybe (List {r | device : String}) -> Maybe (List {r | device : String})
addDevice vs = 
  Just (List.map (\({device} as volume) -> {volume | device = "/dev/"++device}) (withDefault [] vs))

transformers =  Dict.fromList [
    ("AWS", ((Focus.update (awsModel => aws => blockDevices) addDevice) <<
             (Focus.update (awsModel => aws => volumes) addDevice)))
  , ("Openstack", Focus.update (openstackModel => openstack => volumes) addDevice)
  ]

persistModel f ({stage} as model) action =
  case (Dict.get (toString stage) encoders) of
     Just encode -> 
        case (Dict.get (toString stage) transformers) of
          Just transform -> 
            (model, f (E.encode 0 (encode (transform model))) action)

          Nothing -> 
            (model, f (E.encode 0 (encode model)) action)

     Nothing -> 
       none model


