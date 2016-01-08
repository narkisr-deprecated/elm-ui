module Systems.View.Common where

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
  
 
