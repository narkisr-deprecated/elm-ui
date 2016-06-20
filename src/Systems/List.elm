module Systems.List exposing (..)

import Cmd exposing (map)

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (type', class, id, style, attribute)

import Http exposing (Error(BadResponse))
import Json.Decode as Json exposing (..)

import Task exposing (Task)
import Dict exposing (Dict)
import Debug
import Systems.Model.Common exposing (Machine, System, emptySystem)
import Systems.Model.AWS exposing (emptyAws)
import Systems.Decoders exposing (..)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)

import String exposing (isEmpty)
import Set exposing (Set)

-- Components
import Common.Components exposing (info, callout)
import Pager exposing (..)
import Table 
import Search

-- Model

type alias Systems = 
  ((Dict String Int), List (String, System))

type Error = 
    NoSystemSelected
  | SearchParseFailed String
  | NoError

type alias Model = 
  { error : Error
  , systems : Systems
  , pager : Pager.Model
  , table : Table.Model System
  , search : Search.Model}

init : (Model, Effects Action)
init =
 let 
   systems = (Dict.empty, [("", emptySystem)])
   table = Table.init "systemsListing" True ["#","Hostname", "Type", "Env","Owner"] systemRow "Systems"
   search = Search.init
 in
  (Model NoError systems Pager.init table search, getSystems 1 10)

-- Update

type Action = 
      SetSystems(Result Http.Error Systems)
    | GotoPage Pager.Action
    | LoadPage (Table.Action System)
    | Searching Search.Action
    | NoOp

setSystems model ((meta, items) as systemsResult) = 
  let
    total = Maybe.withDefault 0 (Dict.get "total" meta)
    newPager = (Pager.update (Pager.UpdateTotal (Basics.toFloat total)) model.pager)
    newTable = (Table.update (Table.UpdateRows items) model.table)
  in
    ({ model | systems = systemsResult, pager = newPager, table = newTable } , Effects.none)

update : Action ->  Model-> (Model , Effects Action)
update action ({error, table} as model) =
  case action of

    SetSystems result ->
      successHandler result model (setSystems model) NoOp
      
    GotoPage pageAction -> 
      case pageAction of

        Pager.NextPage page -> 
          let
            newPager = (Pager.update pageAction model.pager)
          in
           if isEmpty model.search.input then
            ({model | pager = newPager}, getSystems page 10)
           else 
            ({model | pager = newPager}, getSystemsQuery page 10 model.search.parsed)

        _ ->
          (model , Effects.none)

    Searching searchAction -> 
      let 
        newSearch = (Search.update searchAction model.search)
      in
      case searchAction of 
        Search.Result True res ->
           ({ model | search = newSearch , error = NoError}, getSystemsQuery model.pager.page 10 newSearch.parsed)

        Search.Result False res ->
          if isEmpty newSearch.input then
            ({ model | search = newSearch, error = NoError }, getSystems model.pager.page 10)
          else
            ({ model | search = newSearch, error = SearchParseFailed newSearch.error }, Effects.none)

        _ -> 
          (model, Effects.none)

    LoadPage tableAction -> 
      let
        newTable = Table.update tableAction model.table
      in
        if error == NoSystemSelected && newTable.selected /= Set.empty then
          ({ model | table = newTable , error = NoError }, Effects.none)
        else 
          ({ model | table = newTable }, Effects.none)

    NoOp ->
      (model , Effects.none)

-- View

systemRow : String -> System -> List Html
systemRow id {env, owner, type', machine} = 
 [
   td_ [ text id ]
 , td_ [ text (.hostname machine) ]
 , td_ [ text type' ]
 , td_ [ text env]
 , td_ [ text owner]
 ]

flash : Model -> Html
flash model =
  let 
    result = div [class "callout callout-danger"]
  in
    case model.error of
      NoError ->
        div [] []

      NoSystemSelected ->
        callout "danger" (info "Please select a system first")

      SearchParseFailed error ->
        callout "danger" (info error)


view : Signal.Address Action -> Model -> List Html
view address model = 
  let 
   (meta,systems) = model.systems
  in
    [
     row_ [
      div [class "col-md-12"] [
         Search.view (Signal.forwardTo address Searching) model.search
       ]
     ],

     row_ [
       flash model
     , div [class "col-md-offset-1 col-md-10"] [
         panelDefault_ (Table.view (Signal.forwardTo address LoadPage) model.table)
       ]
     ],
      row_ [(Pager.view (Signal.forwardTo address GotoPage) model.pager)]
    ]
       

-- Decoding
systemPair : Decoder (String, System)
systemPair = 
  tuple2 (,)
    string systemDecoder

systemPage : Decoder ((Dict String Int) , (List (String, System)))
systemPage = 
  object2 (,)  
    ("meta" := dict int) 
    ("systems" := list systemPair)

-- Effects
getSystems : Int -> Int -> Effects Action
getSystems page offset = 
  getJson systemPage ("/systems?page=" ++ (toString page) ++  "&offset=" ++ (toString offset)) 
    |> Task.toResult
    |> Task.map SetSystems
    |> Effects.task

getSystemsQuery : Int -> Int  -> String -> Effects Action
getSystemsQuery page offset query= 
  getJson systemPage ("/systems/query?page=" ++ (toString page) ++  "&offset=" ++ (toString offset) ++ "&query=" ++ query)
    |> Task.toResult
    |> Task.map SetSystems
    |> Effects.task

