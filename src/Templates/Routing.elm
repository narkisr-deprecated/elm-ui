module Templates.Routing exposing (..)

import Hop.Types exposing (PathMatcher)
import Hop.Matchers exposing (..)

type Route = 
  Add
    | List
    | View String
    | Delete String
    | Launch String

matcherAdd: PathMatcher Route
matcherAdd =
    match1 Add "/add"

matcherList: PathMatcher Route
matcherList =
    match1 List "/list"

matcherDelete: PathMatcher Route
matcherDelete =
    match2 Delete "/delete/" str

matcherLaunch: PathMatcher Route
matcherLaunch =
    match2 Launch "/launch/" str


matchers : List (PathMatcher Route)
matchers =
  [ matcherAdd, matcherList, matcherLaunch, matcherDelete ]
