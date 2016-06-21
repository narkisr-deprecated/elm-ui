module Systems.View.GCE exposing (..)

import Html exposing (..)
import Common.Utils exposing (partition, withDefaultProp)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Systems.Model.Common exposing (Machine)
import Systems.Model.GCE exposing (GCE)
import Bootstrap.Html exposing (..)
import Maybe exposing (withDefault)
import Common.Components exposing (fixedPanel)
import Common.Summary exposing (..)
import Platform.Cmd exposing (map)
import Common.Summary exposing (..)
import String

-- Model 
type alias Model = 
  {
   id : Int
  }

init : (Model , Effects Msg)
init =
  (Model 0 , Effects.none)
  
-- Update
type Msg = 
  NoOp

-- View
summarySections : (GCE, Machine) -> List (List Html)
summarySections ((gce, machine) as model)=
   List.filter (not << List.isEmpty) [ 
     overviewSection "Instance"
       ["type", "os", "zone", "project id"]
       [gce.machineType, machine.os, gce.zone, gce.projectId]
   , overviewSection "Security"
       ["user", "tags" ]
       [ machine.user, (String.join " " (withDefault [] gce.tags))]
   , overviewSection "Networking"
       ["hostname", "domain", "ip", "static ip" ]
       [ machine.hostname, machine.domain, withDefault "" machine.ip, withDefault "" gce.staticIp]

   ]

summarize: (GCE, Machine) -> List Html
summarize model =
  [div [] [ h4 [] [(text "System overview")] 
          , div [style [("line-height", "1.8"),("list-style-type", "none") ]] 
             (summarySections model |> List.map summaryPanel
                                    |> partition 2 
                                    |> (List.map List.concat) 
                                    |> (List.map row_))
          ]
  ]


view : Model -> Html Msg
view model =
  fixedPanel (div [] [])


