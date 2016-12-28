module Common.Components exposing (..)

import Html.Attributes exposing (class, style)
import Html exposing (..)
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (class, for, placeholder, attribute, type_, checked, value, style, id)
import Json.Decode as Json exposing (at, string, list)
import Maybe exposing (withDefault)
import Common.Utils exposing (defaultEmpty)
import Dict exposing (Dict)


row_ : List (Html msg) -> Html msg
row_ html =
    div [ class "row" ] html


panelDefault_ : List (Html msg) -> Html msg
panelDefault_ html =
    div [ class "panel panel-default" ] html


notImplemented =
    div []
        [ text "not implemented"
        ]


fixedSize height =
    style
        [ ( "height", "auto !important" )
        , ( "overflow", "auto" )
        , ( "min-height", height )
        , ( "height", height )
        ]



-- panels


panelContents body =
    div [ class "panel-body" ]
        [ body ]


panel body =
    div [ class "panel panel-default" ]
        [ body ]


asList body =
    [ body ]


fixedPanel body =
    div [ class "panel-body", (fixedSize "550px") ]
        [ body
        ]



-- Dialogs


message title content =
    [ h4 [] [ text title ]
    , span [] content
    ]


info msg =
    message "Info" [ text msg ]


error msg =
    message "Error!" [ text msg ]


dialogButtons cancel ok =
    row_
        [ div [ class "text-center" ]
            [ div [ class "btn-group col-md-offset-5 col-md-10" ]
                [ button [ class "btn btn-danger btn-sm col-md-1 col-md-offset-1", onClick cancel ]
                    [ text (toString cancel)
                    ]
                , button [ class "btn btn-primary btn-sm col-md-1", onClick ok ]
                    [ text (toString ok)
                    ]
                ]
            ]
        ]


callout type_ message =
    div [ class "col-md-offset-1 col-md-10" ]
        [ div [ class ("callout callout-" ++ type_) ] message
        ]


dialogPanel type_ message body =
    [ row_
        [ callout type_ message
        ]
    , row_
        [ div [ class "col-md-offset-1 col-md-10" ]
            [ body
            ]
        ]
    ]


withButtons cancel ok panel =
    List.append panel (asList (dialogButtons cancel ok))


infoCallout message body cancel ok =
    dialogPanel "info" message body
        |> withButtons cancel ok
        |> div []


dangerCallout message body cancel ok =
    dialogPanel "danger" message body
        |> withButtons cancel ok
        |> div []


warningCallout message body cancel ok =
    dialogPanel "warning" message body
        |> withButtons cancel ok
        |> div []
