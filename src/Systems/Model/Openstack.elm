module Systems.Model.Openstack exposing (..)

import Dict
import Maybe exposing (withDefault)


type alias Volume =
    { device : String
    , size : Int
    , clear : Bool
    }


type alias Openstack =
    { flavor : String
    , tenant : String
    , keyName : String
    , floatingIp : Maybe String
    , floatingIpPool : Maybe String
    , securityGroups : Maybe (List String)
    , networks : List String
    , volumes : Maybe (List Volume)
    }


emptyVolume : Volume
emptyVolume =
    Volume "" 0 False


emptyOpenstack : Openstack
emptyOpenstack =
    Openstack "" "" "" Nothing Nothing Nothing [] Nothing
