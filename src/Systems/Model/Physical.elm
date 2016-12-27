module Systems.Model.Physical exposing (..)

import Maybe


type alias Physical =
    { mac : Maybe String
    , broadcast : Maybe String
    }


emptyPhysical : Physical
emptyPhysical =
    Physical Nothing Nothing
