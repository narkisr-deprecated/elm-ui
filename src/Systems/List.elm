module Systems.List exposing (..)

import Platform.Cmd as Cmd
import Html exposing (..)
import Html.Attributes exposing (type_, class, id, style, attribute)
import Http
import Json.Decode as Json exposing (..)
import Task exposing (Task)
import Dict exposing (Dict)
import Debug
import Systems.Model.Common exposing (Machine, System, emptySystem)
import Systems.Model.AWS exposing (emptyAws)
import Systems.Decoders exposing (..)
import Common.Errors exposing (successHandler)
import Common.Components exposing (row_, panelDefault_)
import Common.Http exposing (getJson)
import Common.Utils exposing (none)
import String exposing (isEmpty)
import Set exposing (Set)


-- Components

import Common.Components exposing (info, callout)
import Pager exposing (..)
import Table
import Search exposing (Msg(Result), parser)


-- Model


type alias Systems =
    ( Dict String Int, List ( String, System ) )


type Error
    = NoSystemSelected
    | SearchParseFailed String
    | NoError


type alias Model =
    { error : Error
    , systems : Systems
    , pager : Pager.Model
    , table : Table.Model System
    , search : Search.Model
    }


init : ( Model, Cmd Msg )
init =
    let
        systems =
            ( Dict.empty, [ ( "", emptySystem ) ] )

        table =
            Table.init "systemsListing" True [ "#", "Hostname", "Type", "Env", "Owner" ] systemRow "Systems"

        search =
            Search.init
    in
        ( Model NoError systems Pager.init table search, getSystems 1 10 )


listSearch result b =
    (Searching (Result result b))



-- Update


type Msg
    = SetSystems (Result Http.Error Systems)
    | GotoPage Pager.Msg
    | LoadPage (Table.Msg System)
    | Searching Search.Msg
    | NoOp


setSystems model (( meta, items ) as systemsResult) =
    let
        total =
            Maybe.withDefault 0 (Dict.get "total" meta)

        newPager =
            (Pager.update (Pager.UpdateTotal (Basics.toFloat total)) model.pager)

        newTable =
            (Table.update (Table.UpdateRows items) model.table)
    in
        none ({ model | systems = systemsResult, pager = newPager, table = newTable })


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ error, table } as model) =
    case msg of
        SetSystems result ->
            successHandler result model (setSystems model) NoOp

        GotoPage pageMsg ->
            case pageMsg of
                Pager.NextPage page ->
                    let
                        newPager =
                            (Pager.update pageMsg model.pager)
                    in
                        if isEmpty model.search.input then
                            ( { model | pager = newPager }, getSystems page 10 )
                        else
                            ( { model | pager = newPager }, getSystemsQuery page 10 model.search.parsed )

                _ ->
                    none model

        Searching searchMsg ->
            let
                newSearch =
                    (Search.update searchMsg model.search)
            in
                case searchMsg of
                    Search.Result res True ->
                        ( { model | search = newSearch, error = NoError }, getSystemsQuery model.pager.page 10 newSearch.parsed )

                    Search.Result res False ->
                        if isEmpty newSearch.input then
                            ( { model | search = newSearch, error = NoError }, getSystems model.pager.page 10 )
                        else
                            none { model | search = newSearch, error = SearchParseFailed newSearch.error }

                    Search.Parse s ->
                        ( model, parser s )

                    _ ->
                        none model

        LoadPage tableMsg ->
            let
                newTable =
                    Table.update tableMsg model.table
            in
                if error == NoSystemSelected && newTable.selected /= Set.empty then
                    none { model | table = newTable, error = NoError }
                else
                    none { model | table = newTable }

        NoOp ->
            none model



-- View


systemRow : String -> System -> List (Html msg)
systemRow id { env, owner, type_, machine } =
    [ td [] [ text id ]
    , td [] [ text (.hostname machine) ]
    , td [] [ text type_ ]
    , td [] [ text env ]
    , td [] [ text owner ]
    ]


flash : Model -> Html Msg
flash model =
    let
        result =
            div [ class "callout callout-danger" ]
    in
        case model.error of
            NoError ->
                div [] []

            NoSystemSelected ->
                callout "danger" (info "Please select a system first")

            SearchParseFailed error ->
                callout "danger" (info error)


view : Model -> Html Msg
view model =
    let
        ( meta, systems ) =
            model.systems
    in
        div []
            [ row_
                [ div [ class "col-md-12" ]
                    [ Html.map Searching (Search.view model.search)
                    ]
                ]
            , row_
                [ flash model
                , div [ class "col-md-offset-1 col-md-10" ]
                    [ panelDefault_
                        [ Html.map LoadPage (Table.view model.table)
                        ]
                    ]
                ]
            , row_ [ Html.map GotoPage (Pager.view model.pager) ]
            ]



-- Decoding


systemPair : Decoder ( String, System )
systemPair =
    map2 (,)
        (index 0 string)
        (index 1 systemDecoder)


systemPage : Decoder ( Dict String Int, List ( String, System ) )
systemPage =
    map2 (,)
        (field "meta" (dict int))
        (field "systems" (list systemPair))



-- Http


getSystems : Int -> Int -> Cmd Msg
getSystems page offset =
    getJson systemPage ("/systems?page=" ++ (toString page) ++ "&offset=" ++ (toString offset)) SetSystems


getSystemsQuery : Int -> Int -> String -> Cmd Msg
getSystemsQuery page offset query =
    getJson systemPage ("/systems/query?page=" ++ (toString page) ++ "&offset=" ++ (toString offset) ++ "&query=" ++ query) SetSystems
