module Nav.Header exposing (..)

import Html exposing (..)
import Html.Attributes exposing (type', class, id, href, attribute, height, width, alt, src, style)
import Users.Session exposing (getSession, Session, emptySession, logout)

import Common.Redirect exposing (redirect)
import Common.Errors exposing (successHandler)
import Common.Utils exposing (none)
import Http exposing (Error(BadResponse))
import Html.Events exposing (onClick)
import Users.Session exposing (isUser)
import Common.NewTab exposing (newtab)
import String
import Nav.Common exposing (Active(Users), Section(List))

type alias Model = 
  {
    session : Session
  }

init : (Model , Cmd Msg)
init =
  none (Model emptySession)


type Msg = 
   SignOut
    | SetSession Session
    | Redirect (Result Http.Error String)
    | LoadSwagger
    | NoOp 
    | Goto Active Section

setSession model session = 
   none {model | session = session }

update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  case msg of
    SetSession session -> 
       none { model | session = session }

    SignOut -> 
     (model, logout Redirect)

    Redirect _ -> 
     (model, redirect "login")

    LoadSwagger -> 
      (model, (newtab "swagger/index.html"))

    _ -> 
      none model


navHeader : Html Msg
navHeader  =
 div [class  "navbar-header"] [
   img [src "assets/img/cropped.png", alt "Celestial", width 110 , height 50] []
 ]

dropdown attrs = 
  List.append [attribute "aria-expanded" "false", class "dropdown-toggle", attribute "data-toggle" "dropdown", href "#" ] attrs

gearsButton : Session -> Html Msg
gearsButton session =
  if isUser session then 
     i [ class "fa fa-gears", style [("color", "gray"), ("pointer-events", "none")]] [ ] 
  else
    div [class "dropdown pull-right"] [
        i (dropdown [ class "fa fa-gears", style [("color", "black")]]) []
      , ul [ class "dropdown-menu" ] [
          li [] [ a [href "#", onClick (Goto Users List)] [text "Users" ] ]
        , li [] [ a [href "#", onClick LoadSwagger] [text "Swagger"] ]
        ] 
      ]

topNav : Session -> Html Msg
topNav ({username, envs} as session) =
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
                   a [ class "btn btn-default btn-flat", href "#", onClick SignOut]
                        [ text "Sign out" ]
                   ]
                ]
            ]
        ]
    , li [] [
        a [ attribute "data-toggle" "control-sidebar", href "#" ] [
             (gearsButton session) 
          ]
        ]
     ]
  ]

view : Model -> Html Msg
view ({session} as model) =
  header [class "main-header"] [
      a [href "/index.html", class "logo"] [
         span [class "logo-mini"] [text "CEL"]   
       , span [class "logo-lg"] [navHeader]   
      ]
    , nav [class "navbar navbar-static-top", attribute "role" "navigation"] [ 
        a [href "#", class "sidebar-toggle", 
           attribute "data-toggle" "offcanvas",attribute "role" "button"] [
          span [class "sr-only"][text "Toggle navigation"]
        ]
      , (topNav session)
     ]
  ]
  


