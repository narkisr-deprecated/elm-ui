module Systems.View.AWS exposing (..)

import Html exposing (..)
import Common.Utils exposing (partition, withDefaultProp)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Systems.Model.Common exposing (Machine)
import Systems.Model.AWS exposing (AWS)
import Bootstrap.Html exposing (..)
import Maybe exposing (withDefault)
import Common.Components exposing (fixedPanel, asList)
import Platform.Cmd exposing (map)
import Common.Summary exposing (..)
import Common.Utils exposing (none)
import String

-- Model
type alias Model =
  {
   id : Int
  }

init : (Model , Cmd msg)
init =
  none (Model 0)


-- View
summarySections : (AWS, Machine) -> List (List (Html msg))
summarySections ((aws, machine) as model)=
   List.filter (not << List.isEmpty) [
     overviewSection "Instance"
       ["type", "os", "endpoint", "availability zone"]
       [aws.instanceType, machine.os, aws.endpoint, withDefault "" aws.availabilityZone]
   , overviewSection "Security"
       ["user", "keypair", "security groups" ]
       [ machine.user, aws.keyName, (String.join " " (withDefault [] aws.securityGroups))]
   , overviewSection "DNS"
       ["hostname", "domain", "ip" ]
       [ machine.hostname, machine.domain, withDefault "" machine.ip]
   , optionalSection "VPC"
       ["VPC id", "Subnet id", "Assign IP"]
       (List.map (withDefaultProp aws.vpc "") [.vpcId , .subnetId])
       (aws.vpc /= Nothing)
   , tablizedSection "EBS volumes"
       ["device", "size", "type", "clear"] (withDefault [] aws.volumes)
       [.device, (toString << .size), .type', (toString << .clear)]
   , tablizedSection "Instance store blocks"
       ["device", "volume"] (withDefault [] aws.blockDevices)
       [.device, .volume]

   ]

summarize: (AWS, Machine) -> List (Html msg)
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


