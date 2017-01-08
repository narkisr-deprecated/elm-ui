module Systems.Core exposing (..)

import Html
import Systems.List as List exposing (Error(NoSystemSelected, NoError), listSearch)
import Systems.Launch as Launch exposing (Msg(Cancel, SetupJob, Run))
import Nav.Common exposing (Active(Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Html exposing (..)
import Platform.Cmd exposing (map)
import Common.Utils exposing (none)
import Common.Components exposing (notImplemented)
import Table as Table
import Set


type alias Model =
    { systemsList : List.Model
    , systemsLaunch : Launch.Model
    , navChange : Maybe String
    }


init : ( Model, Cmd Msg )
init =
    let
        ( systemsList, systemsListMsg ) =
            List.init

        ( systemsLaunch, _ ) =
            Launch.init
    in
        ( Model systemsList systemsLaunch Nothing, Cmd.map SystemsListing systemsListMsg )


type Msg
    = SystemsListing List.Msg
    | SystemsLaunch Launch.Msg
    | NoOp


searching result b =
    listSearch result b


setupJob : Launch.Msg -> Model -> ( Model, Cmd Msg )
setupJob msg ({ systemsList, systemsLaunch } as model) =
    let
        ( _, systems ) =
            systemsList.systems

        table =
            systemsList.table

        selected =
            List.filter (\( id, s ) -> Set.member id table.selected) systems

        selectedTable =
            { table | rows = selected, selected = Set.empty, id = "launchListing" }

        ( newLaunch, effect ) =
            Launch.update msg { systemsLaunch | table = selectedTable }
    in
        if List.isEmpty selected then
            none { model | systemsList = { systemsList | error = NoSystemSelected } }
        else
            let
                newList =
                    { systemsList | error = NoError }
            in
                ( { model | systemsLaunch = newLaunch, systemsList = newList, navChange = Just "#/systems/launch" }, Cmd.map SystemsLaunch effect )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ systemsList } as model) =
    case msg of
        SystemsListing systemsMsg ->
            let
                ( newSystems, effect ) =
                    List.update systemsMsg systemsList
            in
                ( { model | systemsList = newSystems }, Cmd.map SystemsListing effect )

        SystemsLaunch launchMsg ->
            case launchMsg of
                Launch.Cancel ->
                    none { model | navChange = Just "#/systems/list" }

                Launch.JobLaunched _ ->
                    none { model | navChange = Just "#/jobs/list" }

                SetupJob job ->
                    setupJob launchMsg model

                Run ->
                    let
                        ( newLaunch, effect ) =
                            Launch.update launchMsg model.systemsLaunch
                    in
                        ( { model | systemsLaunch = newLaunch }, Cmd.map SystemsLaunch effect )

                _ ->
                    none model

        NoOp ->
            none model


view : String -> Model -> Html Msg
view path model =
    case path of
        "launch" ->
            Html.map SystemsLaunch (Launch.view model.systemsLaunch)

        _ ->
            Html.map SystemsListing (List.view model.systemsList)
