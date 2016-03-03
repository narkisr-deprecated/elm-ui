module Common.Summary where

import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)

overviewSection : String -> List String -> List String ->  List Html
overviewSection title headers values =
   [ text title
   , ul [style [("list-style-type", "none")]] 
       (List.map2 (\ title value -> li [] [(text (title ++ ": "++ value))] ) headers values)
   ]

summaryPanel : List Html -> List Html
summaryPanel contents =
  [ div [class "panel col-md-4 col-md-offset-1"] [
      div  [class "panel-body"] contents
    ] 
  ]
  
optionalSection : String -> List String -> List String -> Bool -> List Html
optionalSection title headers values pred =
  if pred then
    overviewSection title headers values
  else
    []

tablizedSection : String -> List String -> List a -> List (a -> String) -> List Html
tablizedSection title headers rows props =
  if (not (List.isEmpty rows)) then
      [ text title
      , table [class "table", id title]
         [thead []
            [ tr [] (List.map (\k -> (th [] [text k])) headers)]
            , tbody [] (List.map (\value -> (tablizedRow props value)) rows)
         ]
      ]
  else 
    []

tablizedRow: List (a -> String) -> a -> Html
tablizedRow props v = 
   tr [] (List.map (\prop -> td [] [text (prop v)]) props) 
 
