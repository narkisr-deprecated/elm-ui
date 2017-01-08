port module Main exposing (..)

import Html
import Task
import Application as App exposing (init, view, update, Msg(MenuMsg, UrlChange, SearchMsg), Model, searchMsg)
import Json.Encode as E exposing (list, string)
import Task exposing (Task)


-- Searching

import Search exposing (Msg(Result), ParseResult)


-- Polling

import Time exposing (Time, second)
import Jobs.List exposing (Msg(Polling))
import Jobs.Core as Jobs


-- Common

import Common.Menu exposing (menuPort, intoMsg)


-- Navigation

import Navigation
import Platform.Sub as Subs
import Debug


main =
    Navigation.program UrlChange
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub App.Msg
subscriptions model =
    Sub.batch
        [ Sub.map (\v -> (intoMsg v)) (menuPort MenuMsg)
        , Time.every second
            (\_ -> (App.JobsMsg (Jobs.JobsListing Polling)))
        , Sub.map (\v -> (searchMsg v True)) (parsingOk SearchMsg)
        , Sub.map (\v -> (searchMsg v False)) (parsingErr SearchMsg)
        ]


port parsingErr : (ParseResult -> msg) -> Sub msg


port parsingOk : (ParseResult -> msg) -> Sub msg
