module Systems.Add.Encoders where

import Json.Encode exposing (..)
import Systems.Model.Common exposing (..)
import Systems.Add.AWS exposing (Model, ebsTypes)
import Dict exposing (Dict)
import Maybe exposing (withDefault)
import String

volumeEncoder : Volume -> Value
volumeEncoder volume =
  object [
      ("volume-type", string (withDefault "" (Dict.get volume.type' ebsTypes)))
    , ("size", int volume.size)
    , ("iops", int (withDefault 0 volume.iops))
    , ("device", string volume.device)
    , ("clear", bool volume.clear)
  ]


blockEncoder : Block -> Value
blockEncoder block =
  object [
      ("volume", string block.volume)
    , ("device", string block.device)
  ]

vpcEncoder : VPC -> Value
vpcEncoder ({vpcId} as vpc) =
  if String.isEmpty vpcId then
    null
  else
    object [
        ("subnet-id", string vpc.subnetId)
      , ("vpc-id", string vpc.vpcId)
      , ("assign-public", bool vpc.assignPublic)
    ]

awsEncoder :Model -> Value
awsEncoder ({aws} as model) =
  object [
      ("key-name", string aws.keyName)
    , ("endpoint", string aws.endpoint)
    , ("instance-type", string aws.instanceType)
    , ("availability-zone", string (withDefault "" aws.availabilityZone))
    , ("security-groups", list (List.map string aws.securityGroups))
    , ("vpc", vpcEncoder aws.vpc)
    , ("block-devices", list (List.map blockEncoder aws.blockDevices))
    , ("volumes", list (List.map volumeEncoder aws.volumes))
  ]

machineEncoder : Model -> Value
machineEncoder ({machine} as model) =
  object [
      ("domain", string machine.domain)
    , ("hostname", string machine.hostname)
    , ("os", string machine.os)
    , ("user", string machine.user)
  ]

