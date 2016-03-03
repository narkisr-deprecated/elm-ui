module Types.View where

import Effects exposing (Effects)
import Html exposing (..)
import Types.Model exposing (Type)
import Common.Utils exposing (partition, withDefaultProp)
import Bootstrap.Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Common.Summary exposing (..)
import Maybe exposing (withDefault)


type alias Model = 
  {}
 
init : (Model , Effects Action)
init =
  (Model, Effects.none)

-- Update 

type Action = 
  NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   NoOp -> 
     (model, Effects.none)

-- View

summarySections : Type  -> List (List Html)
summarySections {type', description} =
   List.filter (not << List.isEmpty) [ 
     overviewSection "Type"
       ["type", "description"]
       [type', withDefault "" description]
   ]

summarize: Type -> List Html
summarize model =
  [div [] [ h4 [] [(text "Type")] 
          , div [style [("line-height", "1.8"),("list-style-type", "none") ]] 
             (summarySections model |> List.map summaryPanel
                                    |> partition 2 
                                    |> (List.map List.concat) 
                                    |> (List.map row_))
          ]
  ]

view : Signal.Address Action -> Model -> Html
view address model =
  div [] [
  ]


