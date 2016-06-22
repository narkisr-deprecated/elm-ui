module Systems.View.Openstack exposing (..)

import Html exposing (..)
import Common.Utils exposing (partition, withDefaultProp)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Systems.Model.Common exposing (Machine)
import Systems.Model.Openstack exposing (Openstack)
import Bootstrap.Html exposing (..)
import Maybe exposing (withDefault)
import Common.Components exposing (fixedPanel)
import Common.Summary exposing (..)
import Platform.Cmd exposing (map)
import String
import Common.Utils exposing (none)

-- Model 
type alias Model = 
  {
   id : Int
  }

init : (Model , Cmd msg)
init =
  none (Model 0)
  
-- View
summarySections : (Openstack, Machine) -> List (List (Html msg))
summarySections ((openstack, machine) as model)=
   List.filter (not << List.isEmpty) [ 
     overviewSection "Instance"
       ["flavor", "os", "tenant"]
       [openstack.flavor, machine.os, openstack.tenant]
   , overviewSection "Security"
       ["user", "keypair", "security groups" ]
       [ machine.user, openstack.keyName, (String.join " " (withDefault [] openstack.securityGroups))]
   , overviewSection "Networking"
       ["hostname", "domain", "ip", "ip pool", "networks" ]
       [ machine.hostname, machine.domain, withDefault "" openstack.floatingIp
       , withDefault "" openstack.floatingIpPool, (String.join " " openstack.networks)]
   , tablizedSection "Volumes" 
       ["device", "size", "clear"] (withDefault [] openstack.volumes)
       [.device, (toString << .size), (toString << .clear)]
   ]

summarize: (Openstack, Machine) -> List (Html msg)
summarize model =
  [div [] [ h4 [] [(text "System overview")] 
          , div [style [("line-height", "1.8"),("list-style-type", "none") ]] 
             (summarySections model |> List.map summaryPanel
                                    |> partition 2 
                                    |> (List.map List.concat) 
                                    |> (List.map row_))
          ]
  ]


view : Model -> Html msg
view model =
  fixedPanel (div [] [])


