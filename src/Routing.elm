module Routing (..) where

import Hop.Types exposing (Config, Location, Query, Router, PathMatcher, newLocation)
import Hop.Matchers exposing (..)
import Systems.Routing as Systems
import Types.Routing as Types

type Route =
 SystemsRoute Systems.Route   
  | TypesRoute Types.Route   
  | JobsRoute
  | NotFoundRoute


defaultRoute = 
  SystemsRoute Systems.List

matcherSystems: PathMatcher Route
matcherSystems =
  nested1 SystemsRoute "/systems" Systems.matchers

matcherTypes: PathMatcher Route
matcherTypes =
  nested1 TypesRoute "/types" Types.matchers


matchers : List (PathMatcher Route)
matchers =
  [ matcherSystems, matcherTypes ]


config : Config Route
config =
  { basePath = "\\?\\#\\/"
  , hash = True
  , matchers = matchers
  , notFound = NotFoundRoute
  }
