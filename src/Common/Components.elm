module Common.Components where

import Html.Attributes exposing (class, style)
import Html exposing (..)
import Html.Events exposing (onClick)
import Bootstrap.Html exposing (..)

panelContents :  Html -> List Html
panelContents body =
  let 
    height = "550px"
  in 
  [ div [class "panel-body"
        , style [ ("height","auto !important")
                , ("overflow", "auto")
                , ("min-height", height)
                , ("height", height)]] [body]
  ]


dialogPanel : String -> Signal.Address a -> List Html -> Html -> a -> a -> List Html
dialogPanel type' address message body cancel ok = 
  [ row_ [
     div [class "col-md-offset-1 col-md-10"] [
      div [ class ("callout callout-" ++ type') ] message
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
            text (toString cancel)
          ]
       ,  button [class "btn btn-primary btn-sm col-md-1", onClick address ok ][
           text (toString ok) 
         ]
      ]
    ]
  ]
 ]

infoCallout address message body cancel ok = 
  dialogPanel "info" address message body cancel ok

dangerCallout address message body cancel ok = 
  dialogPanel "danger" address message body cancel ok

warningCallout address message body cancel ok = 
  dialogPanel "warning" address message body cancel ok


