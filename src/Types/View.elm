module Types.View exposing (..)


import Html exposing (..)
import Types.Model as Model exposing (Type, PuppetStd, emptyType)
import Common.Model exposing (valueOf)
import Common.Utils exposing (partition, withDefaultProp)
import Bootstrap.Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Common.Summary exposing (..)
import Common.Components exposing (asList)
import Maybe exposing (withDefault)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none, capitalize)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Basics.Extra exposing (never)
import Task
import Dict exposing (Dict)
import String


type alias Model =
  {
   type' : Type
  }

init : (Model , Cmd Msg)
init =
  none (Model emptyType)

-- Update

type Msg =
  ViewType String
    | SetType (Result Http.Error Type)
    | NoOp

setType : Model -> Type -> (Model , Cmd Msg)
setType model type' =
  none {model | type' = type'}


update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  case msg of
   ViewType id ->
     (model, getType id SetType)

   SetType result ->
      successHandler result model (setType model) NoOp

   NoOp ->
     none model

-- View

optionsList options =
  case options of
    Just vs ->
      String.join "," (Dict.values (Dict.map (\k o -> k ++ ": " ++ (valueOf o) ++ ", ") vs))

    Nothing ->
      ""


moduleSection env {args, module', classes} =
  let
    cs = String.join " " (Dict.keys classes)
    os = optionsList module'.options
    args' = String.join ", " args
  in
  [overviewSection (capitalize env)
     ["name", "source", "arguments", "options", "classes"]
     [module'.name, module'.src, args', os, cs]]

puppetSummary :  Dict String PuppetStd -> List (List (Html Msg))
puppetSummary puppetStd =
  Dict.foldl
    (\env std res -> List.append (moduleSection env std) res) [] puppetStd

summarySections : Type  -> List (List (Html Msg))
summarySections {type', description, puppetStd} =
    List.append
     [overviewSection "Type" ["type", "description"] [type', withDefault "" description]]
     (puppetSummary puppetStd)

summarize: Type -> Html Msg
summarize model =
   div [style [("line-height", "1.8"), ("list-style-type","none")]]
     (summarySections model |> List.map summaryPanel
                            |> partition 2
                            |> (List.map List.concat)
                            |> (List.map row_))

view : Model -> Html Msg
view model =
  div [] [
    h4 [] [text "Type"]
  , (summarize model.type')
  ]


getType id msg =
  getJson Model.type' ("/types/" ++ id)
    |> Task.toResult
    |> Task.perform never msg

