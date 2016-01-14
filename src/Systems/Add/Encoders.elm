module Systems.Add.Encoders where

import Json.Encode exposing (..)
import Systems.Model.Common exposing (..)
import Systems.Model.AWS as AWSModel exposing (..)
import Systems.Model.Openstack as OpenstackModel exposing (..)
import Systems.Add.AWS as AWS exposing (ebsTypes)
import Systems.Add.GCE as GCE 
import Systems.Add.Openstack as Openstack
import Systems.Add.Digital as Digital
import Dict exposing (Dict)
import Maybe exposing (withDefault)
import Common.Utils exposing (defaultEmpty)
import String

awsVolumeEncoder : AWSModel.Volume -> Value
awsVolumeEncoder volume =
  object [
      ("volume-type", maybeString (Dict.get volume.type' ebsTypes))
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
    , ("availability-zone", maybeString aws.availabilityZone)
    , ("security-groups", list (List.map string (defaultEmpty aws.securityGroups)))
    , ("vpc", vpcEncoder (withDefault emptyVpc aws.vpc))
    , ("block-devices", list (List.map blockEncoder (defaultEmpty aws.blockDevices)))
    , ("volumes", list (List.map awsVolumeEncoder (defaultEmpty aws.volumes)))
  ]

gceEncoder : GCE.Model -> Value
gceEncoder ({gce} as model) =
  object [
      ("machine-type", string gce.machineType)
    , ("zone", string gce.zone)
    , ("tags", list (List.map string (defaultEmpty gce.tags)))
    , ("project-id", string gce.projectId)
  ]

digitalEncoder : Digital.Model -> Value
digitalEncoder ({digital} as model) =
  object [
      ("size", string digital.size)
    , ("region", string digital.region)
    , ("private-networking", bool digital.privateNetworking)
  ]

openstackVolumeEncoder : OpenstackModel.Volume -> Value
openstackVolumeEncoder volume =
  object [
      ("device", string volume.device)
    , ("size", int volume.size)
    , ("clear", bool volume.clear)
  ]


maybeString optional = 
  case optional of 
    Just value -> 
      (string value)
    Nothing -> 
      null

openstackEncoder : Openstack.Model -> Value
openstackEncoder ({openstack} as model) =
  object [
      ("flavor", string openstack.flavor)
    , ("tenant", string openstack.tenant)
    , ("floating-ip", maybeString openstack.floatingIp)
    , ("floating-ip-pool", maybeString openstack.floatingIpPool)
    , ("key-name", string openstack.keyName)
    , ("security-groups", list (List.map string (defaultEmpty openstack.securityGroups)))
    , ("networks", list (List.map string openstack.networks))
    , ("volumes", list (List.map openstackVolumeEncoder (defaultEmpty openstack.volumes)))
  ]

machineEncoder : Machine -> Value
machineEncoder machine =
  object [
      ("domain", string machine.domain)
    , ("hostname", string machine.hostname)
    , ("os", string machine.os)
    , ("user", string machine.user)
  ]

