module Routing.Config (..) where

import Hop.Types exposing (Config, Location, Query, Router, PathMatcher, newLocation)
import Hop.Matchers exposing (..)
import Routing.Model exposing (..)
import Systems.Routing.Config as Systems

matcherSystems: PathMatcher Route
matcherSystems =
  nested1 SystemsRoute "/systems" Systems.matchers


matchers : List (PathMatcher Route)
matchers =
  [ matcherSystems ]


config : Config Route
config =
  { basePath = "\\?\\#\\/"
  , hash = True
  , matchers = matchers
  , notFound = NotFoundRoute
  }
