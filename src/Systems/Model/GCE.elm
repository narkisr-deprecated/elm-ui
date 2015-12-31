module Systems.Model.GCE where
import Maybe exposing (withDefault)

type alias GCE = 
  { 
    machineType : String,
    zone : String,
    tags : List String,
    projectId : String
  }

emptyGce : GCE 
emptyGce = 
  let
    type' = (withDefault "" (List.head machineTypes))
    zone = (withDefault "" (List.head zones))
  in
    GCE type' zone [] ""

machineTypes = [
    "n1-standard-1", "n1-standard-2", "n1-standard-4", 
    "n1-standard-8", "n1-standard-16", "n1-standard-32"
  ]

zones = [
   "us-east1-b", "us-east1-c", "us-east1-d", "us-central1-a",
   "us-central1-b", "us-central1-c", "us-central1-f", "europe-west1-b",
   "europe-west1-c", "europe-west1-d", "asia-east1-a", "asia-east1-b",
   "asia-east1-c"
  ]


