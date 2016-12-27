module Pager exposing (..)

import Html exposing (..)
import Html.Attributes exposing (src, style, class)
import Html.Events exposing (onClick)
import Array
import Basics
import Debug


-- MODEL


type alias Model =
    { total : Float
    , page : Int
    , offset : Float
    , maxButtons : Int
    , slice : Int
    }


type Msg
    = NextPage Int
    | UpdateTotal Float
    | NoOp


init =
    { total = 0, page = 1, offset = 10, maxButtons = 5, slice = 0 }



-- Update


update : Msg -> Model -> Model
update msg ({ slice, maxButtons, page } as model) =
    case msg of
        NextPage curr ->
            let
                start =
                    slice

                end =
                    slice + maxButtons

                newModel =
                    { model | page = curr }
            in
                if start < curr && curr < end then
                    newModel
                    -- page within current slice we stay put
                else if curr >= end && curr + maxButtons >= pageCount model then
                    { newModel | slice = (curr - maxButtons) }
                    -- last in view
                else if curr >= end then
                    { newModel | slice = curr - 1 }
                    -- single right move
                else if curr == 1 then
                    { newModel | slice = 0 }
                    -- got to first
                else if curr <= start then
                    { newModel | slice = curr - 1 }
                    -- single left move
                else
                    newModel

        UpdateTotal t ->
            if t < (toFloat page) then
                { model | total = t, page = 1 }
            else
                { model | total = t, page = page }

        NoOp ->
            model



-- View


pageCount : Model -> Int
pageCount model =
    model.total / model.offset |> Basics.ceiling


arrows : ( ( String, Int ), ( String, Int ) ) -> Bool -> List (Html Msg)
arrows shapes active =
    let
        operation p =
            if active then
                (NextPage p)
            else
                NoOp

        isActive =
            if active then
                ""
            else
                "disabled"

        ( ( firstShape, firstPos ), ( secondShape, secondPos ) ) =
            shapes
    in
        [ li [ class isActive ] [ a [ onClick (operation firstPos) ] [ text firstShape ] ]
        , li [ class isActive ] [ a [ onClick (operation secondPos) ] [ text secondShape ] ]
        ]


pageLinks : Model -> List (Html Msg)
pageLinks ({ maxButtons, slice } as model) =
    let
        isActive page =
            if model.page == page then
                "active"
            else
                ""

        pageLink page =
            li [ class (isActive page) ] [ a [ onClick (NextPage page) ] [ text (toString page) ] ]

        next =
            arrows ( ( ">", (model.page + 1) ), ( ">>", (pageCount model) ) ) (model.page < (pageCount model))

        last =
            arrows ( ( "<<", 1 ), ( "<", (model.page - 1) ) ) (model.page > 1)

        links =
            (Array.map (\p -> pageLink (p + 1)) (Array.initialize (pageCount model) identity))

        sliced =
            Array.slice slice (slice + maxButtons) links

        windowed =
            if (Array.length links) > maxButtons then
                sliced
            else
                links
    in
        List.concat [ last, (Array.toList windowed), next ]


view : Model -> Html Msg
view model =
    p [ class "text-center" ]
        [ nav []
            [ ul [ class "pagination" ] (pageLinks model)
            ]
        ]
