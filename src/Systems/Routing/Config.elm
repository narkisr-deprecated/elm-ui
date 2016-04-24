module Systems.Routing.Config where

import Hop.Types exposing (Config, Location, Query, Router, PathMatcher, newLocation)
import Hop.Matchers exposing (..)
import Systems.Routing.Model exposing (Route(Add,List))

matcherAdd: PathMatcher Route
matcherAdd =
    match1 Add "/add"

matcherList: PathMatcher Route
matcherList =
    match1 List "/list"


matchers : List (PathMatcher Route)
matchers =
  [ matcherAdd, matcherList ]
