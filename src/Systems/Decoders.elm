module Systems.Decoders exposing (..)

import Systems.Model.Common exposing (..)
import Systems.Model.AWS as AWS exposing (..)
import Systems.Model.GCE exposing (..)
import Systems.Model.Digital exposing (..)
import Systems.Model.Physical exposing (..)
import Systems.Model.Openstack as Openstack exposing (..)
import Systems.Model.KVM as KVM exposing (..)
import Json.Decode as Json exposing (..)
import Common.Http exposing (apply)

vpcDecoder : Decoder VPC
vpcDecoder =
  object3 VPC
   ("subnetId" := string)
   ("vpcId" := string)
   ("assignIp" := bool)


blockDecoder : Decoder Block
blockDecoder =
  object2 Block
   ("volume" := string)
   ("device" := string)

awsVolumeDecoder : Decoder AWS.Volume
awsVolumeDecoder =
  object5 AWS.Volume
   ("volume-type" := string)
   ("size" := int)
   (maybe ("iops" := int))
   ("device" := string)
   ("clear" := bool)

awsDecoder: Decoder AWS
awsDecoder =
  map AWS
    ("instance-type" := string)
   `apply` (maybe ("instance-id" := string))
   `apply` ("key-name" := string)
   `apply` ("endpoint" := string)
   `apply` (maybe ("availability-zone" := string))
   `apply` (maybe ("security-groups" := list string))
   `apply` (maybe ("ebs-optimized" := bool))
   `apply` (maybe ("volumes" := list awsVolumeDecoder))
   `apply` (maybe ("block-devices" := list blockDecoder))
   `apply` (maybe ("vpc" := vpcDecoder))


gceDecoder: Decoder GCE
gceDecoder =
  object5 GCE
    ("machine-type" := string)
    ("zone" := string)
    (maybe ("tags" := list string))
    ("project-id" := string)
    (maybe ("static-ip" := string))

digitalDecoder: Decoder Digital
digitalDecoder =
  object3 Digital
    ("size" := string)
    ("region" := string)
    ("private-networking" := bool)

physicalDecoder: Decoder Physical
physicalDecoder =
  object2 Physical
    (maybe ("mac" := string))
    (maybe ("broadcast" := string))

kvmDecoder: Decoder KVM
kvmDecoder =
  object1 KVM
    ("node" := string)

openstackVolumeDecoder : Decoder Openstack.Volume
openstackVolumeDecoder =
  object3 Openstack.Volume
   ("device" := string)
   ("size" := int)
   ("clear" := bool)


openstackDecoder: Decoder Openstack
openstackDecoder =
  map Openstack
   ("flavor" := string)
   `apply` ("tenant" := string)
   `apply` ("key-name" := string)
   `apply` (maybe ("floating-ip" := string))
   `apply` (maybe ("floating-ip-pool" := string))
   `apply` (maybe ("security-groups" := list string))
   `apply` ("networks" := list string)
   `apply` (maybe ("volumes" := list openstackVolumeDecoder))

machineDecoder: Decoder Machine
machineDecoder =
  object7 Machine
    ("user" := string)
    ("hostname" := string)
    ("domain" := string)
    (maybe ("ip" := string))
    ("os" := string)
    (maybe ("ram" := int))
    (maybe ("cpu" := int))


systemDecoder : Decoder System
systemDecoder =
   map System
    ("owner" := string )
    `apply` ("env" := string )
    `apply` ("type" := string )
    `apply` ("machine" := machineDecoder)
    `apply` (maybe ("aws" := awsDecoder))
    `apply` (maybe ("gce" := gceDecoder))
    `apply` (maybe ("digital-ocean" := digitalDecoder))
    `apply` (maybe ("openstack" := openstackDecoder))
    `apply` (maybe ("physical" := physicalDecoder))
    `apply` (maybe ("kvm" := kvmDecoder))




