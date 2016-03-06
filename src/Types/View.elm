module Types.View where

import Effects exposing (Effects)
import Html exposing (..)
import Types.Model as Model exposing (Type, emptyType)
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

summarySections : Type  -> List (List Html)
summarySections {type', description} =
   List.filter (not << List.isEmpty) [ 
     overviewSection "Type"
       ["type", "description"]
       [type', withDefault "" description]
   ]

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

