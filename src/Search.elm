port module Search exposing (..)

import Task
import Dict exposing (Dict, get)
import Common.Utils exposing (none)


-- Html

import Common.Components exposing (row_)
import Html.Attributes exposing (type_, class, id, for, placeholder, attribute)
import Html.Events exposing (onInput)
import Html exposing (..)
import Debug


-- Model


type alias Model =
    { input : String, parsed : String, error : String }


init : Model
init =
    { input = "", parsed = "", error = "" }



-- Update


type alias ParseResult =
    { message : String, source : String, result : String }


type Msg
    = Parse String
    | Result ParseResult Bool
    | NoOp


update : Msg -> Model -> Model
update msg model =
    case msg of
        Result { message, source, result } True ->
            ({ model | parsed = result, input = source, error = "" })

        Result { message, source } False ->
            ({ model | error = message, input = source })

        Parse s ->
            model

        _ ->
            model



-- View


searchForm : Model -> Html Msg
searchForm model =
    form [ class "form-horizontal" ]
        [ div [ class "form-group", attribute "onkeypress" "return event.keyCode != 13;" ]
            [ label [ for "systemSearch", class "col-sm-1 control-label" ] [ text "Filter:" ]
            , div [ class "col-sm-6" ]
                [ input
                    [ class "form-control"
                    , type_ "search"
                    , id "systemSearch"
                    , placeholder ""
                    , onInput Parse
                    ]
                    []
                ]
            ]
        ]


view : Model -> Html Msg
view model =
    div [ class "container-fluid" ]
        [ row_
            [ div [ class "col-md-8 col-md-offset-2" ] [ searchForm model ]
            ]
        ]


port parser : String -> Cmd msg
