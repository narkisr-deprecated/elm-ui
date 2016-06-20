module Search exposing (..)

import Task
import Effects exposing (Effects, Never, map)
import Signal exposing (Signal, map, filter)
import Dict exposing (Dict, get)

-- Html

import Bootstrap.Html exposing (..)
import Html.Attributes exposing (type', class, id, for, placeholder, attribute)
import Html.Events exposing (targetValue, on, onClick, onKeyPress)
import Html exposing (..)
import Debug

-- SIGNALS 

searchActions : Signal.Mailbox Action
searchActions =
  Signal.mailbox NoOp

-- Model 

type alias Model = 
  { input : String, parsed : String, error : String}


init : Model
init  =
  { input = "" , parsed = "" , error = ""}

-- Update

type alias ParseResult = { message : String, source : String , result : String }

type Action = 
   Parse String
     | Result Bool ParseResult
     | NoOp 

update : Action ->  Model-> Model
update action model =
  case action of 
    Result True {  message , source , result } ->
       ({ model | parsed = result, input = source , error = "" })
    Result False { message , source } ->  
       ({ model | error = message , input = source })
    _ -> 
       model  

-- View

onInput : Signal.Address a -> (String -> a) -> Attribute
onInput address contentToValue =
  on "input" targetValue (\str -> Signal.message address (contentToValue str))


searchForm : Signal.Address Action -> Model -> Html
searchForm address model =
    form [class "form-horizontal"] 
      [ div [class "form-group", attribute "onkeypress" "return event.keyCode != 13;" ]
        [ label [for "systemSearch", class "col-sm-1 control-label"] [text "Filter:"]
        , div [class "col-sm-6"] [
           input 
             [class "form-control"
             , type' "search"
             , id "systemSearch"
             , placeholder "" 
             , onInput searchActions.address Parse
             ] []
          ]
        ]
     ]

view : Signal.Address Action -> Model -> Html
view address model  =
  div [class "container-fluid"] [ row_ [
     div [class "col-md-8 col-md-offset-2"] [searchForm address model ]]
  ]



