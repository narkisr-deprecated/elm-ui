module Common.Components where

import Html.Attributes exposing (class, style)
import Html exposing (..)
import Html.Events exposing (onClick)
import Bootstrap.Html exposing (..)

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


dialogPanel : Signal.Address a -> List Html -> Html -> a -> a -> List Html
dialogPanel address message body cancel ok = 
  [ row_ [
     div [class "col-md-offset-1 col-md-10"] [
      div [ class "callout callout-danger" ] message
     ]
   ] 
  , row_ [
      div [class "col-md-offset-1 col-md-10"] [
        body
      ]
    ]
  , row_ [
     div [class "text-center"] [
       div [class "btn-group col-md-offset-5 col-md-10"] [
           button [class "btn btn-danger btn-sm col-md-1 col-md-offset-1", onClick address cancel ] [
            text "Cancel"
          ]
       ,  button [class "btn btn-primary btn-sm col-md-1", onClick address ok ][
           text "Ok"
         ]
      ]
    ]
  ]
 ]
