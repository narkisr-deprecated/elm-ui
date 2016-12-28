module Application exposing (..)

import Html exposing (..)
import Platform.Cmd exposing (batch, map)
import Html.Attributes exposing (type_, class, id, href, attribute, height, width, alt, src)
import Systems.Core as Systems exposing (Msg(SystemsListing))
import Jobs.Core as Jobs
import Common.Utils exposing (none)
import Common.Components exposing (asList)
import Users.Core as Users
import Common.Editor as Editor
import Debug


-- Navigation

import Navigation
import UrlParser as Url exposing ((</>), (<?>), s, int, stringParam, top)
import Nav.Core as Nav


init : Navigation.Location -> ( Model, Cmd Msg )
init location =
    let
        ( jobs, jobsMsg ) =
            Jobs.init

        ( nav, navMsg ) =
            Nav.init

        ( users, usersMsg ) =
            Users.init

        ( systems, systemsMsg ) =
            Systems.init

        history =
            [ Url.parsePath route location ]

        msgs =
            [ Cmd.map UsersMsg usersMsg
            , Cmd.map SystemsMsg systemsMsg
            , Cmd.map JobsMsg jobsMsg
            , Cmd.map NavMsg navMsg
            ]
    in
        ( Model systems jobs users nav history, Cmd.batch msgs )


type alias Model =
    { systems : Systems.Model
    , jobs : Jobs.Model
    , users : Users.Model
    , nav : Nav.Model
    , history : List (Maybe Route)
    }


type Msg
    = MenuMsg ( String, String, String )
    | NavigateTo String
    | SystemsMsg Systems.Msg
    | JobsMsg Jobs.Msg
    | NavMsg Nav.Msg
    | UsersMsg Users.Msg
    | NewUrl String
    | UrlChange Navigation.Location
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ users, jobs, systems, nav } as model) =
    case msg of
        JobsMsg msg ->
            let
                ( newJob, msgs ) =
                    Jobs.update msg jobs
            in
                ( { model | jobs = newJob }, Cmd.map JobsMsg msgs )

        UsersMsg msg ->
            let
                ( newUsers, msgs ) =
                    Users.update msg users
            in
                ( { model | users = newUsers }, Cmd.map UsersMsg msgs )

        SystemsMsg msg ->
            let
                ( newSystems, msgs ) =
                    Systems.update msg systems
            in
                ( { model | systems = newSystems }, Cmd.map SystemsMsg msgs )

        _ ->
            none model


view : Model -> Html Msg
view ({ nav, systems } as model) =
    div [ class "wrapper" ]
        [ div [ class "content-wrapper" ]
            [ Html.map NavMsg (Nav.headerView nav)
            , section [ class "content" ]
                (asList (Html.map SystemsMsg (Systems.view systems)))
            , Html.map NavMsg (Nav.sideView nav)
            ]
        ]



-- routing


type Route
    = Systems
    | Launch


route : Url.Parser (Route -> a) a
route =
    Url.oneOf [ Url.map Systems top, Url.map Launch top ]
