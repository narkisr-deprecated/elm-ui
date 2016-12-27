module Users.Routing exposing (..)

import Hop.Types exposing (Config, Location, Query, Router, PathMatcher, newLocation)
import Hop.Matchers exposing (..)


type Route
    = Add
    | List
    | View String
    | Delete String


matcherAdd : PathMatcher Route
matcherAdd =
    match1 Add "/add"


matcherList : PathMatcher Route
matcherList =
    match1 List "/list"


matcherView : PathMatcher Route
matcherView =
    match2 View "/view/" str


matcherDelete : PathMatcher Route
matcherDelete =
    match2 Delete "/delete/" str


matchers : List (PathMatcher Route)
matchers =
    [ matcherAdd, matcherList, matcherView, matcherDelete ]
