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
row_ =
    div { class = "row" }


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



-- Form groups


withError : List Error -> String -> String
withError errors class =
    if List.isEmpty errors then
        class
    else
        class ++ " has-error"


toHtml : Error -> Html msg
toHtml error =
    case error of
        Invalid message ->
            span [ class "help-block" ] [ (text message) ]

        None ->
            span [ class "help-block" ] []


withMessage : List Error -> Html msg
withMessage errors =
    if List.isEmpty errors then
        div [] []
    else
        let
            messages =
                List.map toHtml errors
        in
            withDefault (div [] []) (List.head messages)


group : String -> Html msg -> List Error -> Html msg
group title widget errors =
    div [ class (withError errors "form-group"), id title ]
        [ label [ for title, class "col-sm-3 control-label" ] [ (text title) ]
        , div [ class "col-sm-6" ] [ widget ]
        , withMessage errors
        ]


group_ : String -> Html msg -> Html msg
group_ title widget =
    group title widget []


selected : String -> String -> List (Attribute msg)
selected value default =
    if value == default then
        [ attribute "selected" "true" ]
    else
        []


onSelect : (String -> msg) -> Attribute msg
onSelect msg =
    Html.Events.on "change" (Json.map msg (at [ "target", "value" ] string))


onMultiSelect : (String -> msg) -> Attribute msg
onMultiSelect msg =
    Html.Events.on "change" (Json.map msg (at [ "target" ] string))


selector : (String -> msg) -> List String -> String -> Html msg
selector msg options default =
    select [ class "form-control", onSelect msg ]
        (List.map (\opt -> option (selected opt default) [ text opt ]) options)


typedInput : (String -> msg) -> String -> String -> String -> Html msg
typedInput msg place currentValue typed =
    input
        [ class "form-control"
        , type_ typed
        , placeholder place
        , value currentValue
        , onInput msg
        ]
        []


inputNumber : (String -> msg) -> String -> String -> Html msg
inputNumber msg place currentValue =
    typedInput msg place currentValue "number"


inputText : (String -> msg) -> String -> String -> Html msg
inputText msg place currentValue =
    typedInput msg place currentValue "text"


checkbox : msg -> Bool -> Html msg
checkbox msg currentValue =
    input [ type_ "checkbox", onClick msg, checked currentValue ] []


withErrors : Dict String (List Error) -> String -> Html msg -> Html msg
withErrors errors key widget =
    group key widget (defaultEmpty (Dict.get key errors))


buttons ({ hasNext } as model) next back last =
    let
        margin =
            style [ ( "margin-left", "30%" ) ]
    in
        [ button [ id "Back", class "btn btn-primary", margin, onClick back ] [ text "<< Back" ]
        , if hasNext then
            div [ class "btn-group", margin ]
                [ button [ id "Next", class "btn btn-primary", onClick next ] [ text "Next >>" ] ]
          else
            div [ class "btn-group", margin ] last
        ]
