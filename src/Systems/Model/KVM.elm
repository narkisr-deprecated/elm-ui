module Systems.Model.KVM exposing (..)


type alias KVM =
    { node : String
    }


emptyKVM : KVM
emptyKVM =
    KVM ""
