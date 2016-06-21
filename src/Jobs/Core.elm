module Jobs.Core exposing (..)


import Html exposing (..)
import Jobs.Routing as Routing exposing (Route)
import Common.Utils exposing (none)

import Jobs.List as List exposing (Msg(Polling))
import Jobs.Stats as Stats

type alias Model = 
  {
     list : List.Model
   , stats : Stats.Model 
  }
 
init : (Model , Effects Msg)
init =
  let
    (stats,statsEffects) = Stats.init
    (list, listEffects) = List.init
    effects = [
       Effects.map JobsListing listEffects
     , Effects.map JobsStats statsEffects
    ]
  in
    (Model list stats, Effects.batch effects)

-- Update 

type Msg = 
  JobsListing List.Msg
    | JobsStats Stats.Msg
    | NoOp

isPolling msg = 
  case msg of
    JobsListing Polling -> 
      True

    JobsStats (Stats.PollMetrics _) -> 
      True

    _ -> 
      False


update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({list, stats} as model)=
  case msg of 
    JobsListing listing -> 
      let
        (newListing, effects) = List.update listing list
      in
        ({model | list = newListing}, Effects.map JobsListing effects) 

    JobsStats sts -> 
      let
        (newStats, effects) = Stats.update sts stats
      in
        ({model | stats = newStats}, Effects.map JobsStats effects) 

     
    NoOp -> 
      none model

-- View

view : Signal.Address Msg -> Model -> Route -> List Html
view address {list, stats} route =
  case route of
    Routing.List -> 
      List.view (Signal.forwardTo address JobsListing) list

    Routing.Stats -> 
      Stats.view (Signal.forwardTo address JobsStats) stats



