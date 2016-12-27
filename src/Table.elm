module Table exposing (..)

import Html exposing (..)
import Html.Attributes exposing (type_, class, id, for, placeholder, style, tabindex, href, attribute)
import Platform.Cmd exposing (map)
import Html.Events exposing (onClick, onDoubleClick)
import Set exposing (Set)


-- Model


type alias Model a =
    { id : String
    , caption : Bool
    , rows : List ( String, a )
    , headers : List String
    , selected : Set String
    , title : String
    , rowFn : String -> a -> List (Html (Msg a))
    }


type Msg a
    = Select String
    | View String
    | SelectAll
    | UpdateRows (List ( String, a ))
    | NoOp


init : String -> Bool -> List String -> (String -> a -> List (Html (Msg a))) -> String -> Model a
init id caption hs f title =
    Model id caption [] hs Set.empty title f



-- Update


update : Msg a -> Model a -> Model a
update msg ({ selected, rows } as model) =
    case msg of
        UpdateRows rs ->
            { model | rows = rs, selected = Set.empty }

        SelectAll ->
            let
                all =
                    Set.fromList (List.map (\( id, _ ) -> id) rows)
            in
                if (selected == all) then
                    { model | selected = Set.empty }
                else
                    { model | selected = all }

        Select id ->
            if (Set.member id model.selected) then
                { model | selected = Set.remove id selected }
            else
                { model | selected = Set.insert id selected }

        _ ->
            model



-- View


headersMap : List String -> List (Html (Msg a))
headersMap keys =
    (List.map (\k -> (th [] [ text k ])) keys)


applySelect : Model a -> String -> List (Html (Msg a)) -> Html (Msg a)
applySelect model id cols =
    let
        background =
            if (Set.member id model.selected) then
                "#e7e7e7"
            else
                ""
    in
        tr [ style [ ( "background", background ) ], onClick (Select id), onDoubleClick (View id) ]
            cols


withCaption : Bool -> String -> List (Html (Msg a)) -> List (Html (Msg a))
withCaption enabled title body =
    if enabled then
        List.append [ caption [] [ text title ] ] body
    else
        body


view : Model a -> Html (Msg a)
view model =
    table [ class "table table-bordered", id model.id ]
        (withCaption model.caption
            model.title
            [ thead []
                [ tr [ onClick SelectAll ] (headersMap model.headers) ]
            , tbody []
                (List.map (\( id, item ) -> applySelect model id (model.rowFn id item)) model.rows)
            ]
        )
