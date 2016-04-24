module Systems.Model.AWS where
import Dict
import Maybe exposing (withDefault)

type alias Volume = 
  { type' : String
  , size : Int
  , iops : Maybe Int
  , device : String
  , clear : Bool
  } 

type alias Block = 
  { volume : String
  , device : String
  }

type alias VPC = 
  { subnetId : String
  , vpcId : String
  , assignPublic : Bool
  }

type alias AWS = 
  { instanceType : String
  , instanceId : Maybe String
  , keyName : String
  , endpoint : String
  , availabilityZone : Maybe String
  , securityGroups : Maybe (List String)
  , ebsOptimized : Maybe Bool
  , volumes : Maybe (List Volume)
  , blockDevices :Maybe (List Block)
  , vpc : Maybe VPC
  }


emptyVolume : Volume
emptyVolume =
  Volume "Magnetic" 50 Nothing "" False

emptyBlock: Block
emptyBlock =
  Block "" ""

emptyVpc : VPC
emptyVpc =
  VPC "" "" False

emptyAws : AWS 
emptyAws = 
  let
    justString = Just ""
    (_,url,_) = withDefault ("","",[]) (Dict.get "us-east-1" endpoints)
    instanceType = 
      case List.head instanceTypes of
        Just small ->
          small
        Nothing ->
           ""
  in
    AWS instanceType Nothing "" url Nothing (Just []) (Just False) (Just []) (Just []) (Just emptyVpc)

instanceTypes = [
    "t1.micro", "m1.small", "m1.medium", "m1.large", "m1.xlarge", "m3.medium", "m3.large", "m3.xlarge",
    "m3.2xlarge", "c1.medium", "c1.xlarge", "c1.xlarge", "cc2.8xlarge", "c3.large", "c3.xlarge", 
    "c3.2xlarge", "c3.4xlarge", "c3.8xlarge", "r3.large", "r3.xlarge", "r3.2xlarge", "r3.4xlarge",
    "r3.8xlarge", "m2.xlarge", "m2.2xlarge", "m2.4xlarge", "cr1.8xlarge", "hi1.4xlarge", "cg1.4xlarge"]

endpoints = Dict.fromList [
   ("us-east-1",("US East (N. Virginia)","ec2.us-east-1.amazonaws.com", ["a", "b", "d", "e"])), 
   ("us-west-1",("US West (N. California)","ec2.us-west-1.amazonaws.com", ["a", "b"])),
   ("us-west-2",("US West (Oregon)","ec2.us-west-2.amazonaws.com", ["a", "b", "c"])), 
   ("eu-west-1",("EU (Ireland)","ec2.eu-west-1.amazonaws.com",["a","b","c"])),
   ("eu-central-1",("EU (Frankfurt)","ec2.eu-central-1.amazonaws.com",["a", "b"])),
   ("ap-southeast-1",("Asia Pacific (Singapore)","ec2.ap-southeast-1.amazonaws.com",["a", "b"])),
   ("ap-southeast-2",("Asia Pacific (Sydney)","ec2.ap-southeast-2.amazonaws.com",["a", "b"])),
   ("ap-northeast-1",("Asia Pacific (Tokyo)","ec2.ap-northeast-1.amazonaws.com",["a", "c"])), 
   ("sa-east-1",("South America (Sao Paulo)","ec2.sa-east-1.amazonaws.com", ["a","b","c"]))]


