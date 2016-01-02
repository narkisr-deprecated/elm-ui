module Systems.Add.Encoders where

import Json.Encode exposing (..)
import Systems.Model.Common exposing (..)
import Systems.Model.AWS exposing (..)
import Systems.Add.AWS as AWS exposing (ebsTypes)
import Systems.Add.GCE as GCE 
import Dict exposing (Dict)
import Maybe exposing (withDefault)
import Common.Utils exposing (defaultEmpty)
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

awsEncoder : AWS.Model -> Value
awsEncoder ({aws} as model) =
  object [
      ("key-name", string aws.keyName)
    , ("endpoint", string aws.endpoint)
    , ("instance-type", string aws.instanceType)
    , ("ebs-optimized", bool (withDefault False aws.ebsOptimized))
    , ("availability-zone", string (withDefault "" aws.availabilityZone))
    , ("security-groups", list (List.map string (defaultEmpty aws.securityGroups)))
    , ("vpc", vpcEncoder (withDefault emptyVpc aws.vpc))
    , ("block-devices", list (List.map blockEncoder (defaultEmpty aws.blockDevices)))
    , ("volumes", list (List.map volumeEncoder (defaultEmpty aws.volumes)))
  ]

gceEncoder : GCE.Model -> Value
gceEncoder ({gce} as model) =
  object [
      ("machine-type", string gce.machineType)
    , ("zone", string gce.zone)
    , ("tags", list (List.map string (defaultEmpty gce.tags)))
    , ("project-id", string gce.projectId)
  ]


machineEncoder : Machine -> Value
machineEncoder machine =
  object [
      ("domain", string machine.domain)
    , ("hostname", string machine.hostname)
    , ("os", string machine.os)
    , ("user", string machine.user)
  ]

