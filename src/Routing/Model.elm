module Routing.Model where
import Systems.Routing.Model as Systems


type Route =
 SystemsRoute Systems.Route   
  | JobsRoute
  | NotFoundRoute


defaultRoute = 
  SystemsRoute Systems.List
