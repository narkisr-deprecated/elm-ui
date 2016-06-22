module Systems.View.Physical exposing (..)

import Html exposing (..)
import Common.Utils exposing (partition, withDefaultProp)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Systems.Model.Common exposing (Machine)
import Systems.Model.Physical exposing (Physical)
import Common.Summary exposing (..)
import Bootstrap.Html exposing (..)
import Maybe exposing (withDefault)
import Common.Components exposing (fixedPanel)
import Common.Utils exposing (none)
import Platform.Cmd exposing (map)
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
   
summarySections : (Physical, Machine) -> List (List (Html msg))
summarySections ((physical, machine) as model) =
   [ 
     overviewSection "Instance" ["os", "user"] 
       [machine.os, machine.user]
   , overviewSection "Networking" ["ip", "hostname", "domain" ] 
      [ withDefault "" machine.ip, machine.hostname, machine.domain ]
   , overviewSection "Interface" ["MAC", "Broadcast"] [ withDefault "" physical.mac, withDefault "" physical.broadcast]
   ]

summarize: (Physical, Machine) -> List (Html msg)
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


