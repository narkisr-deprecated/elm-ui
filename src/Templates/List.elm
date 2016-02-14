module Templates.List where

import Effects exposing (Effects)
import Html exposing (..)
import Maybe exposing (withDefault)
import Task
import Http exposing (Error(BadResponse))
import Json.Decode exposing (..)
import Templates.Model.Common exposing (templateDecoder)
import Pager exposing (..)
import Table
import Common.Http exposing (getJson)
import Common.Errors exposing (successHandler)
import Html.Attributes exposing (type', class, id, style, attribute)

import Bootstrap.Html exposing (..)
import Templates.Model.Common exposing (decodeDefaults, defaultsByEnv, emptyTemplate, Template)

type alias Model = 
  {
    templates : List Template 
  , table : Table.Model Template
  , pager : Pager.Model
  }
 
templateRow : String -> Template -> List Html
templateRow id {name, type', description } = 
    [ td [] [ text name ]
    , td [] [ text type' ]
    , td [] [ text description]
    ]


init : (Model , Effects Action)
init =
  let 
    table = Table.init "templateListing" True ["Name", "Type", "Description"] templateRow "Templates"
  in 
    (Model [] table Pager.init , getTemplates SetTemplates)

-- Update 

type Action = 
  LoadPage (Table.Action Template)
    | GotoPage Pager.Action
    | SetTemplates (Result Http.Error (List Template))
    | NoOp

setTemplates: Model -> List Template -> (Model , Effects Action)
setTemplates model templates = 
  let
    total = List.length templates
    templatePairs = List.map (\ ({type'} as item) -> (type', item)) templates
    newPager = (Pager.update (Pager.UpdateTotal (Basics.toFloat total)) model.pager)
    newTable = (Table.update (Table.UpdateRows templatePairs) model.table)
  in
    ({ model | templates = templates, pager = newPager, table = newTable } , Effects.none)



update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   SetTemplates result ->
     successHandler result model (setTemplates model) NoOp
   
   _ -> 
     (model, Effects.none)

-- View

view : Signal.Address Action -> Model -> List Html
view address ({pager, table} as model) =
  [
    div [] [
      row_ [
        div [class "col-md-offset-1 col-md-10"] [
          panelDefault_ (Table.view (Signal.forwardTo address LoadPage) table)
        ]
      ],
      row_ [(Pager.view (Signal.forwardTo address GotoPage) pager)]
    ]
  ]

findTemplate : Model ->  String -> Template
findTemplate {templates} name =
  withDefault emptyTemplate (List.head (List.filter (\template -> (template.name == name)) templates ))

templateList : Decoder (List Template)
templateList =
   at ["templates"] (list templateDecoder)

-- Effects
getTemplates action = 
  getJson templateList "/templates" 
    |> Task.toResult
    |> Task.map action
    |> Effects.task


