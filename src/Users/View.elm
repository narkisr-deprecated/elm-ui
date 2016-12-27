module Users.View exposing (..)

import Html exposing (..)
import Users.Model as Model exposing (User, emptyUser)
import Common.Model exposing (valueOf)
import Common.Utils exposing (partition, withDefaultProp)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type_, style)
import Common.Summary exposing (..)
import Common.Components exposing (asList)
import Maybe exposing (withDefault)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none, capitalize)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Task
import Dict exposing (Dict)
import String
import Common.Utils exposing (none)
import Basics.Extra exposing (never)


type alias Model =
    { user : User
    }


init : ( Model, Cmd Msg )
init =
    none (Model emptyUser)



-- Update


type Msg
    = ViewUser String
    | SetUser (Result Http.Error User)
    | NoOp


setUser : Model -> User -> ( Model, Cmd Msg )
setUser model user =
    none { model | user = user }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ViewUser id ->
            ( model, getUser id SetUser )

        SetUser result ->
            successHandler result model (setUser model) NoOp

        NoOp ->
            none model



-- View


summarize : User -> Html Msg
summarize model =
    div [ style [ ( "line-height", "1.8" ), ( "list-style-type", "none" ) ] ] []


view : Model -> List (Html Msg)
view { user } =
    asList (div [] [ h4 [] [ (text "User") ], (summarize user) ])


getUser name msg =
    getJson Model.user ("/users/" ++ name)
        |> Task.toResult
        |> Task.perform never msg
