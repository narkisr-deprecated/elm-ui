module Routing (..) where

import Hop.Types exposing (Config, Location, Query, Router, PathMatcher, newLocation)
import Hop.Matchers exposing (..)
import Systems.Routing as Systems
import Types.Routing as Types
import Templates.Routing as Templates

type Route =
 SystemsRoute Systems.Route   
  | TypesRoute Types.Route   
  | TemplatesRoute Templates.Route  
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


matcherTemplates: PathMatcher Route
matcherTemplates =
  nested1 TemplatesRoute "/templates" Templates.matchers



matchers : List (PathMatcher Route)
matchers =
  [ matcherSystems, matcherTypes, matcherTemplates]


config : Config Route
config =
  { basePath = "\\?\\#\\/"
  , hash = True
  , matchers = matchers
  , notFound = NotFoundRoute
  }
