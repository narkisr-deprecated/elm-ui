module Jobs.Stats exposing (..)

import Users.Session exposing (getSession, Session)
import Common.Utils exposing (none)

-- model
import Time exposing (Time,second)
import Maybe exposing (withDefault)
import Date.Format exposing (format)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Date
import Now
import String

-- charting
import Chartjs.Line as Line exposing (..)
import Color exposing (..)

-- view
import Html exposing (..)
import Html.Attributes exposing (type', class, id, style, attribute, href)
import Bootstrap.Html exposing (..)

-- remoting
import Json.Decode as Json exposing (..)
import Task
import Platform.Cmd exposing (map, batch)
import Http exposing (Error(BadResponse))
import Debug

import Common.Redirect exposing (redirect)
import Common.Utils exposing (partition)

type alias Timer = 
  {
    max : Float
  , min : Float
  , mean : Float 
  }

type alias Metrics = 
  {
    startTimer : Timer
  , stopTimer : Timer
  , provisionTimer : Timer
  , reloadTimer : Timer
  }

type alias Model = 
  {
    polls : List (Time, Metrics)
  , charts : List (String,Config) 
  , lastPoll : Time
  , interval : Float
  , enabled : Bool
  }

type Action = 
  PollMetrics Time
    | Load (Result Http.Error Metrics)
    | LoadSession (Result Http.Error Session)
    | NoOp

emptyTimer : Timer
emptyTimer =
  {min = 0, max = 0, mean = 0}

init : (Model , Effects Action)
init =
   (Model [] [] Now.loadTime 15 False, getSession LoadSession)

-- Update

timerConfig : List String -> List (List Float) -> List String -> List (Float -> Color)-> Config
timerConfig xs ysList titles styles =
 (xs , List.map3 (\ys title style -> (title , defStyle style, ys)) ysList titles styles)

timerChart : List (Time, Timer) -> List (Timer -> Float) -> List String -> List (Float -> Color) -> Config
timerChart timers selectors titles styles=
  let
    xs = List.map (\(t,_) -> (format "%H:%M:%S" (Date.fromTime t))) timers
    ysList = List.map (\selector -> (List.map (\(_,v) -> (selector v / second))  timers)) selectors
  in
    timerConfig xs ysList titles styles

pollingTrim : Model -> Metrics -> List (Time, Metrics)
pollingTrim ({lastPoll,polls, interval} as model) metrics =
  if List.length polls < 10 then
      List.append polls [(lastPoll, metrics)]
  else
    (List.append (withDefault [] (List.tail polls)) [(lastPoll, metrics)])

meanMaxMin polls = 
  let 
    startTimes = List.map (\(t, {startTimer}) -> (t, startTimer)) polls
    stopTimes = List.map (\(t, {stopTimer}) -> (t, stopTimer)) polls
    provisionTimes = List.map (\(t, {provisionTimer}) -> (t, provisionTimer)) polls
    reloadTimes = List.map (\(t, {reloadTimer}) -> (t, reloadTimer)) polls
  in
    ( [(\{mean} -> mean), (\{min} -> min), (\{max} -> max)]
    , ["mean", "min", "max"]
    , [(rgba 204 204 255), (rgba 153 204 255), (rgba 51 153 255)]
    , [startTimes, stopTimes, provisionTimes, reloadTimes] 
    , ["Start", "Stop", "Provision", "Reload"] 
    )


setMetrics: Model -> Metrics -> (Model, Effects Action)
setMetrics ({polls} as model) metrics =
  let 
    newPolls = pollingTrim model metrics
    (selectors, titles, styles, samples, headers) = meanMaxMin polls
    newCharts = List.map2 (\ sample header -> (header,(timerChart sample selectors titles styles))) samples headers
   in 
    ({model | polls = newPolls, charts = newCharts} , Effects.none)

setEnabled model ({roles, username} as session) = 
  if List.member "celestial.roles/user" roles then
     none {model | enabled = False } 
  else 
     none {model | enabled = True } 


update : Action ->  Model-> (Model , Effects Action)
update action ({polls, lastPoll, enabled} as model) =
  case action of
    PollMetrics time ->
      if enabled then 
        ({model | lastPoll = time}, getMetrics)
      else
        none model

    Load result ->
       (successHandler result model (setMetrics model) NoOp)

    LoadSession result -> 
      (successHandler result model (setEnabled model) NoOp)

    _ -> 
      (model, Effects.none)

-- View

item : (String,String) -> Html
item ((name,rgba) as pair) =
   li [] [
      div [] 
        [ span [style [("background-color", rgba)]] []
        , (text name)
        ]
    ]

legend : List (String,String) -> Html
legend items = 
  ul [class "legend"] (List.map item items)

rgbString : Color -> String
rgbString color =
  let
    {red, green, blue, alpha} = toRgb color
    rgba = (String.join "," (List.append (List.map toString [red, green, blue]) [toString alpha]))
  in 
    "rgba(" ++  rgba ++ ")"

chart : Config -> String -> Html
chart ((labels,series) as config) header =
 div [class "col-md-6"] 
   [panelDefault_ 
      [ panelHeading_ [text header]
      , panelBody_ 
         [fromElement <| Line.chart 500 200 config { defaultOptions | datasetFill = False }
         , legend (List.map (\(label,{pointColor},_) -> (label, (rgbString pointColor))) series)  ]
      ]
   ]


view : Signal.Address Action -> Model -> List Html
view address ({charts} as model)=
  List.map row_ (partition 2 (List.map (\(header,config) -> chart config header) charts))

-- Decoding

timer : Decoder (Timer)
timer =
  object3 Timer
    ("max" := float)
    ("min" := float)
    ("mean" := float)

metricsDecoder : Decoder (Metrics)
metricsDecoder =
  object4 Metrics
    (at ["default.default.start-time"] timer )
    (at ["default.default.stop-time"] timer )
    (at ["default.default.provision-time"] timer )
    (at ["default.default.reload-time"] timer )

-- Effects

getMetrics : Effects Action
getMetrics = 
  getJson metricsDecoder "/metrics" 
    |> Task.toResult
    |> Task.map Load
    |> Effects.task


