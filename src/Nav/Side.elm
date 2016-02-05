module Nav.Side where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class , href, attribute)
import Effects exposing (Effects)
import Html.Events exposing (onClick)


type Active = 
  Systems 
    | Types 
    | Jobs
    | Templates

type Section = 
  Add 
    | Launch 
    | Delete
    | List 
    | View
    | Stats

type alias Model = 
  { active : Active , section : Section }

init : Model 
init =
   { active = Systems, section = List }

-- Update

type Action = 
  Goto Active Section

update : Action ->  Model-> Model 
update action model =
   case action of
     Goto active section ->
       { model | active = active , section = section }

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

menus : Signal.Address Action -> List Html
menus address =
   [ drop address Systems [List, Add] "fa fa-server"
   , drop address Templates [List] "fa fa-clone"
   , drop address Types [List, Add] "fa fa-archive"
   , drop address Jobs [List, Stats] "fa fa-tasks"
   ]

view : Signal.Address Action -> Model -> List Html
view address model =
 [aside [class "main-sidebar"] 
   [section [class "sidebar"] 
     [ul [class "sidebar-menu"]  (menus address)
     ]
   ]
 ] 
