module Types.View where

import Effects exposing (Effects)
import Html exposing (..)
import Types.Model as Model exposing (Type, PuppetStd, emptyType, valueOf)
import Common.Utils exposing (partition, withDefaultProp)
import Bootstrap.Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Common.Summary exposing (..)
import Maybe exposing (withDefault)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Task
import Dict exposing (Dict)
import String


type alias Model = 
  {
   type' : Type 
  }
 
init : (Model , Effects Action)
init =
  none (Model emptyType)

-- Update 

type Action = 
  ViewType String
    | SetType (Result Http.Error Type)
    | NoOp

setType : Model -> Type -> (Model , Effects Action)
setType model type' =
  none {model | type' = type'}


update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   ViewType id -> 
     (model, getType id)

   SetType result -> 
      successHandler result model (setType model) NoOp
 
   NoOp -> 
     (model, Effects.none)

-- View

optionsList options = 
  case options of 
    Just vs -> 
      String.join "," (Dict.values (Dict.map (\k o -> k ++ ": " ++ (valueOf o) ++ ", ") vs))

    Nothing -> 
      ""


moduleSection env {args, module', classes} = 
  let
    cs = String.join "" (Dict.keys classes)
    os = optionsList module'.options
    args' = String.join "" args
  in 
  [overviewSection env 
     ["name", "source", "arguemnts", "options", "classes"]
     [module'.name, module'.src, args', os, cs]]

puppetSummary :  Dict String PuppetStd -> List (List Html)
puppetSummary puppetStd = 
  Dict.foldl 
    (\env std res -> List.append (moduleSection env std) res) [] puppetStd

summarySections : Type  -> List (List Html)
summarySections {type', description, puppetStd} =
    List.append
     [overviewSection "Type" ["type", "description"] [type', withDefault "" description]]
     (puppetSummary puppetStd)

summarize: Type -> List Html
summarize model =
  [div [] [ h4 [] [(text "Type")] 
          , div [style [("line-height", "1.8"),("list-style-type", "none") ]] 
             (summarySections model |> List.map summaryPanel
                                    |> partition 2 
                                    |> (List.map List.concat) 
                                    |> (List.map row_))
          ]
  ]

view : Signal.Address Action -> Model -> List Html
view address model =
  (summarize model.type')
  

getType : String -> Effects Action
getType id = 
  getJson Model.type' ("/types/" ++ id)
    |> Task.toResult
    |> Task.map SetType
    |> Effects.task

