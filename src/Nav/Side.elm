module Nav.Side exposing (..)

import Bootstrap.Html exposing (..)

import Html exposing (..)
import Users.Session exposing (isUser)
import Html.Attributes exposing (class , href, attribute)
import Users.Session exposing (Session, emptySession)

import Html.Events exposing (onClick)
import Common.Utils exposing (none)
import Nav.Common exposing (Active(Stacks, Types, Systems, Jobs, Templates, Users), Section(Stats, Launch, Add, List, View))

type alias Model = 
  { 
    session : Session
  }

init : Model 
init =
   Model emptySession

-- Update

type Action = 
  NavigateTo String | SetSession Session

update : Action ->  Model-> (Model , Effects Action)
update action model =
   case action of
     SetSession session -> 
       none { model | session = session }

     _ -> 
       none model

-- View

sectionItem : Signal.Address Action -> String -> String -> Html
sectionItem address resource nested =
  li_ [a [class (resource ++ nested), href ("#/" ++ resource ++ "/" ++ nested)] 
        [ i [class "fa fa-circle-o"][]
        , text nested ]
      ]

drop : Signal.Address Action -> String -> List String -> String -> Html
drop address resource actions icon =
  li [class "treeview"] [
    a [class (resource ++ "Menu"), href "#"]  [
      i [class icon] []
    , span [] [text resource]
    , i [class "fa fa-angle-left pull-right"] []
    ] 
      
  , ul [ class "treeview-menu" ] 
      (List.map (\nested -> sectionItem address resource nested) actions)
  ]

adminMenus : Signal.Address Action -> List Html
adminMenus address =
   [  drop address "systems" ["list", "add"] "fa fa-server"
    , drop address "templates" ["list"] "fa fa-clone"
    , drop address "types" ["list", "add"] "fa fa-archive"
    , drop address "jobs" ["list", "stats"] "fa fa-tasks"
    , drop address "users" ["list", "add"] "fa fa-users"
   ]

userMenus : Signal.Address Action -> List Html
userMenus address =
   [   drop address "systems" ["list", "add"] "fa fa-server"
     , drop address "templates" ["list"] "fa fa-clone"
     , drop address "jobs" ["list", "stats"] "fa fa-tasks"
   ]

view : Signal.Address Action -> Model -> List Html
view address {session} =
 [aside [class "main-sidebar"] 
   [section [class "sidebar"] [
       ul [class "sidebar-menu"]
        (if isUser session then
          (userMenus address)
        else
          (adminMenus address))
     ]
   ]
 ] 
