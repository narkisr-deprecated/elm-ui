module Systems.View.GCE where

import Html exposing (..)
import Common.Utils exposing (partition, withDefaultProp)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Systems.Model.Common exposing (Machine)
import Systems.Model.GCE exposing (GCE)
import Bootstrap.Html exposing (..)
import Maybe exposing (withDefault)
import Common.Components exposing (panelContents)
import Systems.View.Common exposing (..)
import Effects exposing (Effects, Never, map)
import Systems.View.Common exposing (..)
import String

-- Model 
type alias Model = 
  {
   id : Int
  }

init : (Model , Effects Action)
init =
  (Model 0 , Effects.none)
  
-- Update
type Action = 
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


view : Signal.Address Action -> Model -> Html
view address model =
  div []
    (panelContents "System" (div [] []))


