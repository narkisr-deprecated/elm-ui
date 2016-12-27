module Users.List exposing (..)

import Html exposing (..)
import Html.App exposing (map)
import Common.Utils exposing (none)
import Users.Model exposing (User, getUsers)
import Http exposing (Error(BadResponse))
import Html.Attributes exposing (class, id, style, attribute)
import Pager exposing (..)
import Common.Errors exposing (successHandler)
import Table
import String
import Html exposing (..)
import Debug


type alias Model =
    { users : List User
    , table : Table.Model User
    , pager : Pager.Model
    }


userRow : String -> User -> List (Html msg)
userRow name { roles, envs } =
    [ td [] [ text name ]
    , td [] [ text (String.join ", " (List.map (\r -> String.dropLeft 16 r) roles)) ]
    , td [] [ text (String.join ", " envs) ]
    ]


init : ( Model, Cmd Msg )
init =
    let
        table =
            Table.init "usersListing" True [ "Name", "Roles", "Environments" ] userRow "Users"
    in
        ( Model [] table Pager.init, getUsers SetUsers )



-- Update


type Msg
    = SetUsers (Result Http.Error (List User))
    | GotoPage Pager.Msg
    | LoadPage (Table.Msg User)
    | NoOp


setUsers : Model -> List User -> ( Model, Cmd Msg )
setUsers ({ pager, table } as model) users =
    let
        total =
            List.length users

        typePairs =
            List.map (\({ username } as user) -> ( username, user )) users

        newPager =
            (Pager.update (Pager.UpdateTotal (Basics.toFloat total)) pager)

        newTable =
            (Table.update (Table.UpdateRows typePairs) table)
    in
        none { model | users = users, pager = newPager, table = newTable }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SetUsers result ->
            successHandler result model (setUsers model) NoOp

        _ ->
            none model



-- View


view : Model -> Html Msg
view ({ pager, table } as model) =
    div [ class "" ]
        [ row_
            [ div [ class "col-md-offset-1 col-md-10" ]
                [ panelDefault_
                    [ (map LoadPage (Table.view table))
                    ]
                ]
            ]
        , row_ [ (map GotoPage (Pager.view pager)) ]
        ]
