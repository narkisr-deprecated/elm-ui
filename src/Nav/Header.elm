module Nav.Header where

import Html exposing (..)
import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src)
import Users.Session exposing (getSession, Session, emptySession, logout)
import Effects exposing (Effects)
import Common.Redirect exposing (successHandler, redirect)
import Http exposing (Error(BadResponse))
import Html.Events exposing (onClick)
import String

type alias Model = 
  { session : Session}

init : (Model , Effects Action)
init =
  (Model emptySession, getSession LoadSession)


type Action = 
  LoadSession (Result Http.Error Session)
    | SignOut
    | Redirect (Result Http.Error String)
    | NoOp 

setSession model session = 
   ({model | session = session }, Effects.none)

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of
    LoadSession result -> 
      (successHandler result model (setSession model) NoOp)

    SignOut -> 
     (model, logout Redirect)

    Redirect _ -> 
     (model, redirect NoOp)

    NoOp -> 
     (model, Effects.none)


navHeader : Html
navHeader  =
 div [class  "navbar-header"] [
   img [src "assets/img/cropped.png", alt "Celestial", width 110 , height 50] []
 ]


topNav : Signal.Address Action  -> Session -> Html
topNav address ({username, envs} as session) =
 div [class "navbar-custom-menu"] [
   ul [class "nav navbar-nav"]
     [li [ class "dropdown user user-menu"] [
        a [attribute "aria-expanded" "false", class "dropdown-toggle", attribute "data-toggle" "dropdown", href "#" ]
            [ span [ class "hidden-xs" ]
                [text  username]
            ]
        , ul [ class "dropdown-menu" ]
            [ li [ class "user-header" ]
                [ p [] [ text ("Environments you can access: " ++ (String.join " " envs)) ]
                ]
            , li [ class "user-body" ] [ ]
            , li [ class "user-footer" ] [
                div [ class "pull-left" ] [
                   a [ class "btn btn-default btn-flat", href "#" ] [
                     text "Profile"
                   ]
                ]
                , div [ class "pull-right" ] [
                   a [ class "btn btn-default btn-flat", href "#", onClick address SignOut]
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

view : Signal.Address Action -> Model -> List Html
view address ({session} as model) =
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
      , (topNav address session)
      ]
    ]
  ]


