module Systems.Decoders where

import Systems.Model.Common exposing (..)
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
   ("type" := string) 
   ("size" := int) 
   ("iops" := maybe int) 
   ("device" := string) 
   ("clear" := bool) 

awsDecoder: Decoder AWS
awsDecoder = 
  map AWS
    ("instanceType" := string)
   `apply` ("keyName" := string)
   `apply` ("endpoint" := string)
   `apply` (maybe ("availabilityZone" := string))
   `apply` ("securityGroups" := list string)
   `apply` ("ebsOptimized" := bool)
   `apply` ("volumes" := list volumeDecoder)
   `apply` ("blockDevices" := list blockDecoder)
   `apply` ("vpc" := vpcDecoder)
 
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
  object5 System 
    ("owner" := string )
    ("env" := string )
    ("type" := string )
    ("machine" := machineDecoder)
    (maybe ("aws" := awsDecoder))



