module Nav.Side exposing (..)

import Html exposing (..)
import Users.Session exposing (isUser)
import Html.Attributes exposing (class, href, attribute)
import Users.Session exposing (Session, emptySession)
import Html.Events exposing (onClick)
import Common.Utils exposing (none)
import Nav.Common exposing (Active(Systems, Jobs), Section(Stats, Launch, List, View))


type alias Model =
    { session : Session
    }


init : Model
init =
    Model emptySession

-- Update

type Msg
    = NavigateTo String
    | SetSession Session


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetSession session ->
            none { model | session = session }

        _ ->
            none model

-- View

sectionItem : String -> String -> Html Msg
sectionItem resource nested =
    li []
        [ a [ class (resource ++ nested), href ("#/" ++ resource ++ "/" ++ nested) ]
            [ i [ class "fa fa-circle-o" ] []
            , text nested
            ]
        ]


drop : String -> List String -> String -> Html Msg
drop resource msgs icon =
    li [ class "treeview" ]
        [ a [ class (resource ++ "Menu"), href "#" ]
            [ i [ class icon ] []
            , span [] [ text resource ]
            , i [ class "fa fa-angle-left pull-right" ] []
            ]
        , ul [ class "treeview-menu" ]
            (List.map (\nested -> sectionItem resource nested) msgs)
        ]


adminMenus : List (Html Msg)
adminMenus =
    [ drop "systems" [ "list", "add" ] "fa fa-server"
    , drop "jobs" [ "list", "stats" ] "fa fa-tasks"
    ]


userMenus : List (Html Msg)
userMenus =
    [ drop "systems" [ "list", "add" ] "fa fa-server"
    , drop "jobs" [ "list", "stats" ] "fa fa-tasks"
    ]


view : Model -> Html Msg
view { session } =
    aside [ class "main-sidebar" ]
        [ section [ class "sidebar" ]
            [ ul [ class "sidebar-menu" ]
                (if isUser session then
                    (userMenus)
                 else
                    (adminMenus)
                )
            ]
        ]
