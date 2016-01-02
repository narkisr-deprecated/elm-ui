module Systems.Decoders where

import Systems.Model.Common exposing (..)
import Systems.Model.AWS exposing (..)
import Systems.Model.GCE exposing (..)
import Json.Decode as Json exposing (..)

apply : Json.Decoder (a -> b) -> Json.Decoder a -> Json.Decoder b
apply func value =
    Json.object2 (<|) func value

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

volumeDecoder : Decoder Volume
volumeDecoder = 
  object5 Volume 
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
   `apply` (maybe ("volumes" := list volumeDecoder))
   `apply` (maybe ("block-devices" := list blockDecoder))
   `apply` (maybe ("vpc" := vpcDecoder))

gceDecoder: Decoder GCE
gceDecoder = 
  object4 GCE
    ("machine-type" := string)
    ("zone" := string)
    (maybe ("tags" := list string))
    ("project-id" := string)

machineDecoder: Decoder Machine
machineDecoder = 
  object5 Machine 
    ("user" := string)
    ("hostname" := string)
    ("domain" := string)
    (maybe ("ip" := string))
    ("os" := string)
    
    
systemDecoder : Decoder System
systemDecoder = 
  object6 System 
    ("owner" := string )
    ("env" := string )
    ("type" := string )
    ("machine" := machineDecoder)
    (maybe ("aws" := awsDecoder))
    (maybe ("gce" := gceDecoder))



