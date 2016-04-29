module Jobs.Routing where

import Hop.Types exposing (PathMatcher)
import Hop.Matchers exposing (..)

type Route = 
  Stats
    | List

matcherStats: PathMatcher Route
matcherStats =
    match1 Stats "/stats"

matcherList: PathMatcher Route
matcherList =
    match1 List "/list"


matchers : List (PathMatcher Route)
matchers =
  [ matcherStats, matcherList ]
