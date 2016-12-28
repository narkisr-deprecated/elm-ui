module Users.Core exposing (..)

import Html exposing (..)
import Html
import Common.Utils exposing (none)
import Common.Components exposing (notImplemented, asList)


type alias Model =
    { navChange : Maybe String }


init : ( Model, Cmd Msg )
init =
    none (Model Nothing)



-- Update


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    none model



-- View


view : Model -> Html Msg
view model =
    div [] []
