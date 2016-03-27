module Nav.Header where

import Html exposing (..)
import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src, style)
import Users.Session exposing (getSession, Session, emptySession, logout)
import Effects exposing (Effects)
import Common.Redirect exposing (redirect)
import Common.Errors exposing (successHandler)
import Common.Utils exposing (none)
import Http exposing (Error(BadResponse))
import Html.Events exposing (onClick)
import Users.Session exposing (isUser)
import Common.NewTab exposing (newtab)
import String
import Nav.Common exposing (Active(Stacks, Types, Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))

type alias Model = 
  {
    session : Session
  }

init : (Model , Effects Action)
init =
  none (Model emptySession)


type Action = 
   SignOut
    | SetSession Session
    | Redirect (Result Http.Error String)
    | LoadUsers
    | LoadSwagger
    | NoOp 
    | Goto Active Section

setSession model session = 
   none {model | session = session }

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of
    SetSession session -> 
       none { model | session = session }

    SignOut -> 
     (model, logout Redirect)

    Redirect _ -> 
     (model, redirect NoOp)

    LoadSwagger -> 
      (model, (newtab NoOp "swagger/index.html"))

    _ -> 
      none model


navHeader : Html
navHeader  =
 div [class  "navbar-header"] [
   img [src "assets/img/cropped.png", alt "Celestial", width 110 , height 50] []
 ]

dropdown attrs = 
  List.append [attribute "aria-expanded" "false", class "dropdown-toggle", attribute "data-toggle" "dropdown", href "#" ] attrs

gearsButton : Signal.Address Action  -> Session -> Html
gearsButton address session =
  if isUser session then 
     i [ class "fa fa-gears", style [("color", "gray"), ("pointer-events", "none")]] [ ] 
  else
    div [class "dropdown pull-right"] [
        i (dropdown [ class "fa fa-gears", style [("color", "black")]]) []
      , ul [ class "dropdown-menu" ] [
          li [] [ a [href "#", onClick address LoadUsers] [text "Users" ] ]
        , li [] [ a [href "#"] [text "Quota"] ]
        , li [] [ a [href "#", onClick address LoadSwagger] [text "Swagger"] ]
        ] 
      ]

topNav : Signal.Address Action  -> Session -> Html
topNav address ({username, envs} as session) =
 div [class "navbar-custom-menu"] [
   ul [class "nav navbar-nav"]
     [li [ class "dropdown user user-menu"] [
         a (dropdown []) [
          span [ class "hidden-xs" ]
            [text  username]
          ]
        , ul [ class "dropdown-menu" ] [
              li [ class "user-header" ] [
                   p [] [
                     text ("Environments you can access: " ++ (String.join " " envs)) 
                   ]
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
             (gearsButton address session) 
          ]
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


