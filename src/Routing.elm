module Routing (..) where

import Hop.Types exposing (Config, Location, Query, Router, PathMatcher, newLocation)
import Hop.Matchers exposing (..)
import Systems.Routing as Systems
import Types.Routing as Types
import Jobs.Routing as Jobs
import Templates.Routing as Templates
import Users.Routing as Users

type Route =
 SystemsRoute Systems.Route   
  | TypesRoute Types.Route   
  | JobsRoute Jobs.Route   
  | TemplatesRoute Templates.Route  
  | UsersRoute Users.Route  
  | NotFoundRoute


notJobs route = 
  case route of 
    JobsRoute _ ->
      False
    _ -> 
      True

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

matcherJobs: PathMatcher Route
matcherJobs =
  nested1 JobsRoute "/jobs" Jobs.matchers

matcherUsers: PathMatcher Route
matcherUsers =
  nested1 UsersRoute "/users" Users.matchers


matchers : List (PathMatcher Route)
matchers =
  [  matcherSystems
   , matcherTypes
   , matcherTemplates
   , matcherJobs
   , matcherUsers
  ]


config : Config Route
config =
  { basePath = "\\?\\#\\/"
  , hash = True
  , matchers = matchers
  , notFound = NotFoundRoute
  }
