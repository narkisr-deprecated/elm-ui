module Nav where

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
  li_ [a [class "", href "#", onClick address (Goto active section)] [text (toString section)]]

drop : Signal.Address Action -> Active -> List Section -> Html
drop address active actions =
  li [class "dropdown"] [
    a [class  "dropdown-toggle"
      , href "#" 
      , attribute "data-toggle" "dropdown"
      , attribute "role" "button"
      , attribute "aria-haspopup" "true"
      , attribute "aria-expanded" "false"
      ] 
      [text (toString active)
      , span [class "caret"] []
      ] 
  , ul [ class "dropdown-menu" ] 
      (List.map (\section -> sectionItem address active section) actions)
  ]

navHeader : Html
navHeader  =
 div' {class ="navbar-header"} 
   [img'  { class = ""
   , src = "assets/img/cropped.png"
   , alt = "Celestial"
   , width  = 110
   , height = 50 } ]

menus : Signal.Address Action -> Html
menus address =
  div [class "collapse navbar-collapse"]  [
    ul [class "nav navbar-nav"] [
      li [class ""] 
        [a [class "", href "" ] [text " "] ]
        , drop address Systems [List, Add]
        , drop address Types [List, Add]
        , drop address Jobs [List, Stats]
        , li [class "" ] [a [class "", href "" ] [text "Documentation"] ]
    ]
  ]

view : Signal.Address Action -> Model -> List Html
view address model =
  [row_ 
    [div [class "col-md-12"] [
       navbarDefault' "" [
        div [class "container-fluid"] [ navHeader , menus address]
       ]
      ]
    ]
  ]
