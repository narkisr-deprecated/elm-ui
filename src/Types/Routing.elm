module Types.Routing where

import Hop.Types exposing (PathMatcher, newLocation)
import Hop.Matchers exposing (..)

type Route = 
  Add
    | List
    | View Int
    | Delete Int
    | Edit Int

matcherAdd: PathMatcher Route
matcherAdd =
    match1 Add "/add"

matcherList: PathMatcher Route
matcherList =
    match1 List "/list"


matchers : List (PathMatcher Route)
matchers =
  [ matcherAdd, matcherList ]
