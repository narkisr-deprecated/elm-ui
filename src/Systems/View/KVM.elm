module Systems.View.KVM exposing (..)

import Html exposing (..)
import Common.Utils exposing (partition, withDefaultProp)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Systems.Model.Common exposing (Machine)
import Systems.Model.KVM exposing (KVM)
import Bootstrap.Html exposing (..)
import Maybe exposing (withDefault)
import Common.Components exposing (fixedPanel)
import Platform.Cmd exposing (map)
import Common.Summary exposing (..)
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
   
summarySections : (KVM, Machine) -> List (List (Html msg))
summarySections ((kvm, machine) as model) =
   [ 
     overviewSection "Network" ["user", "hostname", "domain" ] 
      [machine.os, machine.user,  machine.hostname, machine.domain]
   , overviewSection "Domain" ["os", "node"] 
      [machine.os, kvm.node]
   , overviewSection "Resources" ["cpu", "ram"] 
      [toString (withDefault 0 machine.cpu), toString (withDefault 0 machine.ram)]

   ]

summarize: (KVM, Machine) -> List (Html msg)
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


