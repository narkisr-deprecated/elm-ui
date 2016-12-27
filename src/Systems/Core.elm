module Systems.Core exposing (..)

import Html
import Systems.List as List exposing (Error(NoSystemSelected, NoError))
import Systems.Launch as Launch exposing (Msg(Cancel, SetupJob, Run))
import Nav.Common exposing (Active(Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Html exposing (..)
import Platform.Cmd exposing (batch, map)
import Common.Utils exposing (none)
import Common.Components exposing (notImplemented)
import Common.Redirect exposing (redirect)
import Table as Table
import Set


type alias Model =
    { systemsList : List.Model
    , systemsAdd : Add.Model
    , systemsView : View.Model
    , systemsLaunch : Launch.Model
    , navChange : Maybe String
    }


addedSystem model =
    ( (toString model.systemsAdd.stage), Add.intoSystem model.systemsAdd )


init : ( Model, Cmd Msg )
init =
    let
        ( systemsList, systemsListMsg ) =
            List.init

        ( systemsView, _ ) =
            View.init

        ( systemsAdd, systemsAddMsg ) =
            Add.init

        ( systemsLaunch, _ ) =
            Launch.init

        msgs =
            [ Cmd.map SystemsListing systemsListMsg
            , Cmd.map SystemsAdd systemsAddMsg
            ]
    in
        ( Model systemsList systemsAdd systemsView systemsLaunch Nothing, Cmd.batch msgs )


type Msg
    = SystemsListing List.Msg
    | SystemsAdd Add.Msg
    | SystemsView View.Msg
    | SystemsLaunch Launch.Msg
    | NoOp


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
                ( { model | systemsLaunch = newLaunch, systemsList = newList, navChange = Just "systems/launch" }, Cmd.map SystemsLaunch effect )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ systemsView, systemsList, systemsAdd } as model) =
    case msg of
        SystemsView msg ->
            let
                ( newSystems, msgs ) =
                    View.update msg systemsView
            in
                ( { model | systemsView = newSystems }, Cmd.map SystemsView msgs )

        SystemsListing systemsMsg ->
            case systemsMsg of
                List.LoadPage (Table.View id) ->
                    let
                        ( newSystems, msgs ) =
                            View.update (View.ViewSystem id) systemsView
                    in
                        ( { model | systemsView = newSystems, navChange = Just ("systems/view/" ++ id) }, Cmd.map SystemsView msgs )

                _ ->
                    let
                        ( newSystems, effect ) =
                            List.update systemsMsg systemsList
                    in
                        ( { model | systemsList = newSystems }, Cmd.map SystemsListing effect )

        SystemsAdd systemsMsg ->
            case systemsMsg of
                Add.JobLaunched _ ->
                    none { model | navChange = Just "jobs/list" }

                Add.SaveTemplate ->
                    none { model | navChange = Just "templates/add" }

                Add.Saved next result ->
                    let
                        ( newSystems, newEffects ) =
                            Add.update systemsMsg systemsAdd

                        ( initial, initEffects ) =
                            Add.init
                    in
                        -- If not the default case
                        if newEffects /= Cmd.none && next == Add.NoOp then
                            ( { model | navChange = Just "systems/list", systemsAdd = initial }, Cmd.map SystemsAdd initEffects )
                        else
                            ( { model | systemsAdd = newSystems }, Cmd.map SystemsAdd newEffects )

                _ ->
                    let
                        ( newSystems, effect ) =
                            Add.update systemsMsg systemsAdd
                    in
                        ( { model | systemsAdd = newSystems }, Cmd.map SystemsAdd effect )

        SystemsLaunch launchMsg ->
            case Debug.log "" launchMsg of
                Launch.Cancel ->
                    none { model | navChange = Just "systems/list" }

                Launch.JobLaunched _ ->
                    none { model | navChange = Just "jobs/list" }

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


view : Model -> Html Msg
view model =
    Html.map SystemsListing (List.view model.systemsList)
