module Systems.Model.Common exposing (..)

import Systems.Model.AWS exposing (AWS)
import Systems.Model.GCE exposing (GCE)
import Systems.Model.Digital exposing (Digital)
import Systems.Model.Openstack exposing (Openstack)
import Systems.Model.Physical exposing (Physical)
import Systems.Model.KVM exposing (KVM)
import Dict exposing (Dict)


type alias Machine =
    { user : String
    , hostname : String
    , domain : String
    , ip : Maybe String
    , os : String
    , ram : Maybe Int
    , cpu : Maybe Int
    }


type alias System =
    { owner : String
    , env : String
    , type_ : String
    , machine : Machine
    , aws : Maybe AWS
    , gce : Maybe GCE
    , digital : Maybe Digital
    , openstack : Maybe Openstack
    , physical : Maybe Physical
    , kvm : Maybe KVM
    }


emptyMachine : Machine
emptyMachine =
    Machine "" "" "" Nothing "" Nothing Nothing


resourcedMachine : Int -> Int -> Machine
resourcedMachine cpu ram =
    Machine "" "" "" (Just "") "" (Just ram) (Just cpu)


emptySystem : System
emptySystem =
    let
        base =
            System "" "" ""
    in
        base emptyMachine Nothing Nothing Nothing Nothing Nothing Nothing
