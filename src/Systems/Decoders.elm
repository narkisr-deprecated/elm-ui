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
    map3 VPC
        (field "subnetId" string)
        (field "vpcId" string)
        (field "assignIp" bool)


blockDecoder : Decoder Block
blockDecoder =
    map2 Block
        (field "volume" string)
        (field "device" string)


awsVolumeDecoder : Decoder AWS.Volume
awsVolumeDecoder =
    map5 AWS.Volume
        (field "volume-type" string)
        (field "size" int)
        (maybe (field "iops" int))
        (field "device" string)
        (field "clear" bool)


awsDecoder : Decoder AWS
awsDecoder =
    apply
        (apply
            (apply
                (apply
                    (apply
                        (apply
                            (apply
                                (apply
                                    (apply
                                        (map AWS
                                            (field "instance-type" string)
                                        )
                                        (maybe (field "instance-id" string))
                                    )
                                    (field "key-name" string)
                                )
                                (field "endpoint" string)
                            )
                            (maybe (field "availability-zone" string))
                        )
                        (maybe (field "security-groups" (list string)))
                    )
                    (maybe (field "ebs-optimized" bool))
                )
                (maybe (field "volumes" (list awsVolumeDecoder)))
            )
            (maybe (field "block-devices" (list blockDecoder)))
        )
        (maybe (field "vpc" vpcDecoder))


gceDecoder : Decoder GCE
gceDecoder =
    map5 GCE
        (field "machine-type" string)
        (field "zone" string)
        (maybe (field "tags" (list string)))
        (field "project-id" string)
        (maybe (field "static-ip" string))


digitalDecoder : Decoder Digital
digitalDecoder =
    map3 Digital
        (field "size" string)
        (field "region" string)
        (field "private-networking" bool)


physicalDecoder : Decoder Physical
physicalDecoder =
    map2 Physical
        (maybe (field "mac" string))
        (maybe (field "broadcast" string))


kvmDecoder : Decoder KVM
kvmDecoder =
    map KVM
        (field "node" string)


openstackVolumeDecoder : Decoder Openstack.Volume
openstackVolumeDecoder =
    map3 Openstack.Volume
        (field "device" string)
        (field "size" int)
        (field "clear" bool)


openstackDecoder : Decoder Openstack
openstackDecoder =
    apply
        (apply
            (apply
                (apply
                    (apply
                        (apply
                            (apply
                                (map Openstack
                                    (field "flavor" string)
                                )
                                (field "tenant" string)
                            )
                            (field "key-name" string)
                        )
                        (maybe (field "floating-ip" string))
                    )
                    (maybe (field "floating-ip-pool" string))
                )
                (maybe (field "security-groups" (list string)))
            )
            (field "networks" (list string))
        )
        (maybe (field "volumes" (list openstackVolumeDecoder)))


machineDecoder : Decoder Machine
machineDecoder =
    map7 Machine
        (field "user" string)
        (field "hostname" string)
        (field "domain" string)
        (maybe (field "ip" string))
        (field "os" string)
        (maybe (field "ram" int))
        (maybe (field "cpu" int))


systemDecoder : Decoder System
systemDecoder =
    apply
        (apply
            (apply
                (apply
                    (apply
                        (apply
                            (apply
                                (apply
                                    (apply
                                        (map System
                                            (field "owner" string)
                                        )
                                        (field "env" string)
                                    )
                                    (field "type" string)
                                )
                                (field "machine" machineDecoder)
                            )
                            (maybe (field "aws" awsDecoder))
                        )
                        (maybe (field "gce" gceDecoder))
                    )
                    (maybe (field "digital-ocean" digitalDecoder))
                )
                (maybe (field "openstack" openstackDecoder))
            )
            (maybe (field "physical" physicalDecoder))
        )
        (maybe (field "kvm" kvmDecoder))
