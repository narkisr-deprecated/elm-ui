module Systems.Model.Digital where
import Maybe exposing (withDefault)

type alias Digital = 
  { 
    size   : String,
    region : String,
    privateNetworking : Bool
  }

emptyDigital: Digital
emptyDigital = 
   Digital (withDefault "" (List.head sizes)) (withDefault "" (List.head regions)) False

sizes = ["512mb", "1gb", "2gb", "4gb", "8gb", "16gb", "32gb", "48gb", "64gb"]

regions = ["nyc1", "ams1", "sfo1", "nyc2", "ams2", "sgp1" ]


