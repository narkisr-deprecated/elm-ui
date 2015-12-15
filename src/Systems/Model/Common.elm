module Systems.Model.Common where

type alias Machine = 
  { user : String
  , hostname : String
  , domain : String 
  , ip : Maybe String
  , os : String
  }

type alias System = 
  { owner : String 
  , env : String
  , type' : String 
  , machine: Machine
  , aws : Maybe AWS
  }

-- AWS 
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
  , keyName : String
  , endpoint : String
  , availabilityZone : Maybe String
  , securityGroups : List String 
  , ebsOptimized : Bool
  , volumes : List Volume
  , blockDevices : List Block
  , vpc : VPC
  }
