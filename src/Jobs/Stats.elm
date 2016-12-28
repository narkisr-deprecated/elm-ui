module Jobs.Stats exposing (..)

import Users.Session exposing (getSession, Session)
import Common.Utils exposing (none)


-- model

import Time exposing (Time, second)
import Maybe exposing (withDefault)
import Date.Format exposing (format)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Date


-- import Now

import String


-- charting
-- import Chartjs.Line as Line exposing (..)

import Color exposing (..)


-- view

import Element exposing (toHtml)
import Html exposing (..)
import Html.Attributes exposing (type_, class, id, style, attribute, href)


-- remoting

import Json.Decode as Json exposing (..)
import Task
import Platform.Cmd exposing (map, batch)
import Http
import Debug
import Common.Redirect exposing (redirect)
import Common.Utils exposing (partition)


type alias Timer =
    { max : Float
    , min : Float
    , mean : Float
    }


type alias Metrics =
    { startTimer : Timer
    , stopTimer : Timer
    , provisionTimer : Timer
    , reloadTimer : Timer
    }


type alias Model =
    { polls :
        List ( Time, Metrics )
    , charts :
        List String
    , interval : Float
    , enabled : Bool
    }


type Msg
    = PollMetrics Time
    | Load (Result Http.Error Metrics)
    | LoadSession (Result Http.Error Session)
    | NoOp


emptyTimer : Timer
emptyTimer =
    { min = 0, max = 0, mean = 0 }


init : ( Model, Cmd Msg )
init =
    ( Model [] [] 15 False, getSession LoadSession )
