module Templates.List exposing (..)

import Common.Utils exposing (none)
import Html.App as App 
import Html exposing (..)
import Maybe exposing (withDefault)
import Task
import Http exposing (Error(BadResponse))
import Basics.Extra exposing (never)
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
 
templateRow : String -> Template -> List (Html msg)
templateRow id {name, type', description } = 
    [ td [] [ text name ]
    , td [] [ text type' ]
    , td [] [ text description]
    ]


init : (Model , Cmd Msg)
init =
  let 
    table = Table.init "templateListing" True ["Name", "Type", "Description"] templateRow "Templates"
  in 
    (Model [] table Pager.init , getTemplates SetTemplates)

-- Update 

type Msg = 
  LoadPage (Table.Msg Template)
    | GotoPage Pager.Msg
    | SetTemplates (Result Http.Error (List Template))
    | NoOp

setTemplates: Model -> List Template -> (Model , Cmd Msg)
setTemplates model templates = 
  let
    total = List.length templates
    templatePairs = List.map (\ ({type'} as item) -> (type', item)) templates
    newPager = (Pager.update (Pager.UpdateTotal (Basics.toFloat total)) model.pager)
    newTable = (Table.update (Table.UpdateRows templatePairs) model.table)
  in
    none { model | templates = templates, pager = newPager, table = newTable } 



update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  case msg of 
   SetTemplates result ->
     successHandler result model (setTemplates model) NoOp
   
   _ -> 
     none model

-- View

view : Model -> List (Html Msg)
view ({pager, table} as model) =
  [
    div [] [
      row_ [
        div [class "col-md-offset-1 col-md-10"] [
          panelDefault_ (App.map LoadPage (Table.view table))
        ]
      ],
      row_ [ (App.map GotoPage (Pager.view pager))]
    ]
  ]

findTemplate : Model ->  String -> Template
findTemplate {templates} name =
  withDefault emptyTemplate (List.head (List.filter (\template -> (template.name == name)) templates ))

templateList : Decoder (List Template)
templateList =
   at ["templates"] (list templateDecoder)

-- Http 

getTemplates msg = 
  getJson templateList "/templates" 
    |> Task.toResult
    |> Task.perform never msg


