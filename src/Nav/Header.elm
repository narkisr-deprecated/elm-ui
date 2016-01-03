module Nav.Header where

import Html exposing (..)
import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src)

navHeader : Html
navHeader  =
 div [class  "navbar-header"] [
   img [src "assets/img/cropped.png", alt "Celestial", width 110 , height 50] []
 ]


mainHeader : List Html
mainHeader  =
  [header [class "main-header"] [
      a [href "/index.html", class "logo"] [
         span [class "logo-mini"] [text "CEL"]   
       , span [class "logo-lg"] [navHeader]   
      ]
    , nav [class "navbar navbar-static-top", attribute "role" "navigation"] [ 
        a [href "#", class "sidebar-toggle", 
           attribute "data-toggle" "offcanvas",attribute "role" "button"] [
          span [class "sr-only"][text "Toggle navigation"]
        ]
      , topNav
      ]
    ]
  ]

topNav : Html
topNav =
 div [class "navbar-custom-menu"] [
   ul [class "nav navbar-nav"]
     [li [ class "dropdown user user-menu"] [
        a [attribute "aria-expanded" "false", class "dropdown-toggle", attribute "data-toggle" "dropdown", href "#" ]
            [ span [ class "hidden-xs" ]
                [ text "Set current User!" ]
            ]
        , ul [ class "dropdown-menu" ]
            [ li [ class "user-header" ]
                [ p [] [ text "Alexander Pierce - Web Developer" ]
                ]
            , li [ class "user-body" ] [ ]
            , li [ class "user-footer" ] [
                div [ class "pull-left" ] [
                   a [ class "btn btn-default btn-flat", href "#" ] [
                     text "Profile"
                   ]
                ]
                , div [ class "pull-right" ] [
                   a [ class "btn btn-default btn-flat", href "#" ]
                        [ text "Sign out" ]
                   ]
                ]
            ]
        ]
    , li [] [
        a [ attribute "data-toggle" "control-sidebar", href "#" ] [
          i [ class "fa fa-gears" ] [] ]
        ]
     ]
  ]
