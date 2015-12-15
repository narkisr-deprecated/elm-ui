module Common.Components where

import Html.Attributes exposing (class, style)
import Html exposing (..)

panelContents : String -> Html -> List Html
panelContents title body =
  let 
    height = "550px"
  in 
  [ div [class "panel-heading"] [(text title)]
  , div [class "panel-body"
        , style [ ("height","auto !important")
                , ("overflow", "auto")
                , ("min-height", height)
                , ("height", height)]] [body]
  ]

