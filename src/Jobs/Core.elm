module Jobs.Core exposing (..)


import Html exposing (..)
import Html.App as App
import Jobs.Routing as Routing exposing (Route)
import Common.Utils exposing (none)
import Common.Components exposing (notImplemented)

import Jobs.List as List exposing (Msg(Polling))
import Jobs.Stats as Stats

type alias Model =
  {
     list : List.Model
   , stats : Stats.Model
  }

init : (Model , Cmd Msg)
init =
  let
    (stats,statsEffects) = Stats.init
    (list, listEffects) = List.init
    msgs = [
       Cmd.map JobsListing listEffects
     , Cmd.map JobsStats statsEffects
    ]
  in
    (Model list stats, Cmd.batch msgs)

-- Update

type Msg =
  JobsListing List.Msg
    | JobsStats Stats.Msg
    | NoOp

isPolling msg =
  case msg of
    JobsListing Polling ->
      True

    JobsStats (Stats.PollMetrics _) ->
      True

    _ ->
      False


update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({list, stats} as model)=
  case msg of
    JobsListing listing ->
      let
        (newListing, msgs) = List.update listing list
      in
        ({model | list = newListing}, Cmd.map JobsListing msgs)

    -- JobsStats sts ->
    --   let
    --     (newStats, msgs) = Stats.update sts stats
    --   in
    --     ({model | stats = newStats}, Cmd.map JobsStats msgs)
    --
    _ ->
      none model

-- View

view : Model -> Route -> Html Msg
view {list, stats} route =
  case route of
    Routing.List ->
     App.map JobsListing (List.view list)

    _ ->
      notImplemented
    -- Routing.Stats ->
     -- App.map JobsStats (Stats.view stats)



