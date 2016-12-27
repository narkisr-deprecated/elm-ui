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
                                            ("instance-type" := string)
                                        )
                                        (maybe ("instance-id" := string))
                                    )
                                    ("key-name" := string)
                                )
                                ("endpoint" := string)
                            )
                            (maybe ("availability-zone" := string))
                        )
                        (maybe ("security-groups" := list string))
                    )
                    (maybe ("ebs-optimized" := bool))
                )
                (maybe ("volumes" := list awsVolumeDecoder))
            )
            (maybe ("block-devices" := list blockDecoder))
        )
        (maybe ("vpc" := vpcDecoder))


gceDecoder : Decoder GCE
gceDecoder =
    object5 GCE
        ("machine-type" := string)
        ("zone" := string)
        (maybe ("tags" := list string))
        ("project-id" := string)
        (maybe ("static-ip" := string))


digitalDecoder : Decoder Digital
digitalDecoder =
    object3 Digital
        ("size" := string)
        ("region" := string)
        ("private-networking" := bool)


physicalDecoder : Decoder Physical
physicalDecoder =
    object2 Physical
        (maybe ("mac" := string))
        (maybe ("broadcast" := string))


kvmDecoder : Decoder KVM
kvmDecoder =
    object1 KVM
        ("node" := string)


openstackVolumeDecoder : Decoder Openstack.Volume
openstackVolumeDecoder =
    object3 Openstack.Volume
        ("device" := string)
        ("size" := int)
        ("clear" := bool)


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
                                    ("flavor" := string)
                                )
                                ("tenant" := string)
                            )
                            ("key-name" := string)
                        )
                        (maybe ("floating-ip" := string))
                    )
                    (maybe ("floating-ip-pool" := string))
                )
                (maybe ("security-groups" := list string))
            )
            ("networks" := list string)
        )
        (maybe ("volumes" := list openstackVolumeDecoder))


machineDecoder : Decoder Machine
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
                                            ("owner" := string)
                                        )
                                        ("env" := string)
                                    )
                                    ("type" := string)
                                )
                                ("machine" := machineDecoder)
                            )
                            (maybe ("aws" := awsDecoder))
                        )
                        (maybe ("gce" := gceDecoder))
                    )
                    (maybe ("digital-ocean" := digitalDecoder))
                )
                (maybe ("openstack" := openstackDecoder))
            )
            (maybe ("physical" := physicalDecoder))
        )
        (maybe ("kvm" := kvmDecoder))
