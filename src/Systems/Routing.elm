module Systems.Routing where

import Hop.Types exposing (Config, Location, Query, Router, PathMatcher, newLocation)
import Hop.Matchers exposing (..)

type Route = 
  Add
    | Launch
    | List
    | View Int
    | Delete Int

matcherAdd: PathMatcher Route
matcherAdd =
    match1 Add "/add"

matcherList: PathMatcher Route
matcherList =
    match1 List "/list"

matcherLaunch: PathMatcher Route
matcherLaunch =
    match1 Launch "/launch"


matchers : List (PathMatcher Route)
matchers =
  [ matcherAdd, matcherList, matcherLaunch ]
