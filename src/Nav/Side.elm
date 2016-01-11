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

type Section = 
  Add 
    | Launch 
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

drop : Signal.Address Action -> Active -> List Section -> Html
drop address active actions =
  li [class "treeview"] [
    a [class ((toString active) ++ "Menu"), href "#"]  [
      span [] [text (toString active)]
    , i [class "fa fa-angle-left pull-right"] []
    ] 
      
  , ul [ class "treeview-menu" ] 
      (List.map (\section -> sectionItem address active section) actions)
  ]

menus : Signal.Address Action -> List Html
menus address =
   [ drop address Systems [List, Add]
   , drop address Types [List, Add]
   , drop address Jobs [List, Stats]
   ]

view : Signal.Address Action -> Model -> List Html
view address model =
 [aside [class "main-sidebar"] 
   [section [class "sidebar"] 
     [ul [class "sidebar-menu"]  (menus address)
     ]
   ]
 ] 
