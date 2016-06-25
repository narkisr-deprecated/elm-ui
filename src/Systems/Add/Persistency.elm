module Systems.Add.Persistency exposing (..)

import Platform.Cmd exposing (batch)
import Systems.Add.Encoders exposing (encode)
import Json.Encode as E
import Dict exposing (Dict)
import String
import Focus exposing (Focus, set, (=>), create)
import Common.Utils exposing (none)
import Maybe exposing (withDefault)
import Systems.Model.AWS as AWS exposing (emptyAws)
import Systems.Model.Openstack as Openstack exposing (emptyOpenstack)
import Systems.Model.Common exposing (System)


addDevice : Maybe (List {r | device : String}) -> Maybe (List {r | device : String})
addDevice vs = 
  Just (List.map (\({device} as volume) -> {volume | device = "/dev/"++device}) (withDefault [] vs))

transform ({aws, openstack} as system) stage =
  case stage of
    "AWS" -> 
      let
        justAws = withDefault emptyAws aws
        newAws = {justAws | blockDevices = addDevice justAws.blockDevices, volumes = addDevice justAws.volumes}
      in
       {system | aws = Just newAws}

    "Openstack" -> 
      let
        justStack = withDefault emptyOpenstack openstack
        newStack = {justStack | volumes = addDevice justStack.volumes}
      in
       {system | openstack = Just newStack}

    _ -> 
       system

persistModel : (String -> Cmd a) -> System -> String -> Cmd a
persistModel f system stage =
    (f (E.encode 0 (encode (transform system stage) stage)))

