port module Main exposing (..)

import Html


-- was StartA

import Task
import Application as App exposing (init, view, update, Msg(EditMsg, MenuMsg), Model, urlUpdate)
import Json.Encode as E exposing (list, string)


-- Routing

import Hop
import Hop.Types exposing (Router)
import Routing exposing (..)
import Task exposing (Task)


-- Polling

import Time exposing (Time, second)
import Jobs.List exposing (Msg(Polling))
import Jobs.Core as Jobs


-- Common

import Common.Menu exposing (menuPort, intoMsg)
import Common.EditSub exposing (editorValue)
import Common.Editor exposing (editorOutPort, editorInPort, Msg(Load))


-- Navigation

import Navigation
import Platform.Sub as Subs


main : Program Never
main =
    Navigation.program urlParser
        { init = init
        , view = view
        , update = update
        , urlUpdate = urlUpdate
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub App.Msg
subscriptions model =
    Sub.batch
        [ Sub.map editorValue (editorInPort (EditMsg << Load))
        , Sub.map (\v -> (intoMsg v)) (menuPort MenuMsg)
        , Time.every second (\_ -> (App.JobsMsg (Jobs.JobsListing Polling)))
        ]


port parser : String -> Cmd msg
