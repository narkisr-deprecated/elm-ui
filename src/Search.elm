module Search exposing (..)

import Task
import Dict exposing (Dict, get)

-- Html

import Bootstrap.Html exposing (row_)
import Html.Attributes exposing (type', class, id, for, placeholder, attribute)
import Html.Events exposing (onInput)
import Html exposing (..)
import Debug

-- Model 

type alias Model = 
  { input : String, parsed : String, error : String}


init : Model
init  =
  { input = "" , parsed = "" , error = ""}

-- Update

type alias ParseResult = { message : String, source : String , result : String }

type Msg = 
   Parse String
     | Result Bool ParseResult
     | NoOp 

update : Msg ->  Model-> Model
update msg model =
  case msg of 
    Result True {  message , source , result } ->
       ({ model | parsed = result, input = source , error = "" })
    Result False { message , source } ->  
       ({ model | error = message , input = source })
    _ -> 
       model  

-- View

searchForm : Model -> (Html Msg)
searchForm model =
    form [class "form-horizontal"] 
      [ div [class "form-group", attribute "onkeypress" "return event.keyCode != 13;" ]
        [ label [for "systemSearch", class "col-sm-1 control-label"] [text "Filter:"]
        , div [class "col-sm-6"] [
           input 
             [class "form-control"
             , type' "search"
             , id "systemSearch"
             , placeholder "" 
             , onInput Parse
             ] []
          ]
        ]
     ]

view : Model -> (Html Msg)
view model  =
  div [class "container-fluid"] [
    row_ [
      div [class "col-md-8 col-md-offset-2"] [searchForm model]
    ]
  ]



