module Application exposing (..)

import Html exposing (..)
import Platform.Cmd exposing (batch, map)
import Html.Attributes exposing (type_, class, id, href, attribute, height, width, alt, src)
import Systems.Core as Systems exposing (Msg(SystemsListing))
import Jobs.Core as Jobs
import Common.Utils exposing (none)
import Common.Components exposing (asList)
import Users.Core as Users
import Common.Redirect exposing (redirect)
import Maybe exposing (withDefault)
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

        history =[(Url.parsePath route location)]

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
update msg ({ users, jobs, systems, nav, history } as model) =
    case msg of
        JobsMsg msg ->
            let
                ( newJob, msgs ) =
                    Jobs.update msg jobs
            in
                ( { model | jobs = newJob }, Cmd.map JobsMsg msgs )

        SystemsMsg msg ->
            let
                ( newSystems, msgs ) =
                    Systems.update msg systems
            in
                ( { model | systems = newSystems }, Cmd.map SystemsMsg msgs )

        UrlChange location ->
           let
             newLocation = Url.parseHash route location
           in
             if newLocation == (Just Home) then
                (model, redirect "/systems/list")
             else
                none { model | history =  newLocation :: model.history }

        NewUrl url -> 
           ( model , Navigation.newUrl (Debug.log "" url))

        _ ->
            none model


view : Model -> Html Msg
view ({nav} as model) =
    div [ class "wrapper" ]
        [ div [ class "content-wrapper" ]
            [ Html.map NavMsg (Nav.headerView nav)
            , section [ class "content" ] (routeView model)
            , Html.map NavMsg (Nav.sideView nav)
            ]
        ]


routeView : Model -> List(Html Msg)
routeView ({systems, jobs, history} as model) =
  let 
      last = Maybe.withDefault Nothing (List.head (Debug.log "" history))
  in
    case (Debug.log "" last) of
      Just (SystemsRoute "list") ->
        (asList (Html.map SystemsMsg (Systems.view systems)))

      Just (JobsRoute "list") ->
        (asList (Html.map JobsMsg (Jobs.view jobs)))

      Just Home ->
        (asList (Html.map SystemsMsg (Systems.view systems)))

      _ -> 
         asList(div [][text "non legal path"])


-- routing


type Route
    = SystemsRoute String
    | JobsRoute String
    | Home


route : Url.Parser (Route -> a) a
route =
  Url.oneOf
    [ Url.map Home top
    , Url.map SystemsRoute (Url.s "systems" </> Url.string)
    , Url.map JobsRoute (Url.s "jobs" </> Url.string)
    ]
