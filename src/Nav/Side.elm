module Nav.Side where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Users.Session exposing (isUser)
import Html.Attributes exposing (class , href, attribute)
import Users.Session exposing (Session, emptySession)
import Effects exposing (Effects)
import Html.Events exposing (onClick)
import Common.Utils exposing (none)

type Active = 
  Systems 
    | Types 
    | Jobs
    | Templates
    | Stacks

type Section = 
  Add 
    | Launch 
    | Delete
    | Edit
    | List 
    | View
    | Stats

type alias Model = 
  { active : Active 
  , section : Section 
  , session : Session
  }

init : Model 
init =
   Model Systems List emptySession

-- Update

type Action = 
  Goto Active Section
   | SetSession Session

update : Action ->  Model-> (Model , Effects Action)
update action model =
   case action of
     Goto active section ->
       none { model | active = active , section = section }

     SetSession session -> 
       none { model | session = session }

-- View

sectionItem : Signal.Address Action -> Active -> Section -> Html
sectionItem address active section =
  li_ [a [class ((toString active) ++ (toString section)), 
          href "#", onClick address (Goto active section)] 
        [ i [class "fa fa-circle-o"][]
        , text (toString section) ]
      ]

drop : Signal.Address Action -> Active -> List Section -> String -> Html
drop address active actions icon =
  li [class "treeview"] [
    a [class ((toString active) ++ "Menu"), href "#"]  [
      i [class icon] []
    , span [] [text (toString active)]
    , i [class "fa fa-angle-left pull-right"] []
    ] 
      
  , ul [ class "treeview-menu" ] 
      (List.map (\section -> sectionItem address active section) actions)
  ]

adminMenus : Signal.Address Action -> List Html
adminMenus address =
   [ drop address Systems [List, Add] "fa fa-server"
   , drop address Templates [List] "fa fa-clone"
   , drop address Types [List, Add] "fa fa-archive"
   , drop address Jobs [List, Stats] "fa fa-tasks"
   ]

userMenus : Signal.Address Action -> List Html
userMenus address =
   [ drop address Systems [List, Add] "fa fa-server"
   , drop address Templates [List] "fa fa-clone"
   , drop address Jobs [List] "fa fa-tasks"
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
