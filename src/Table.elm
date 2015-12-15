module Table where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (type', class, id, for, placeholder, style, tabindex, href, attribute)
import Effects exposing (Effects, Never, map)
import Html.Events exposing (onClick, onDoubleClick)
import Set exposing (Set)

-- Model
type alias Model a = 
  { id : String
  , caption : Bool
  , rows : List (String, a)
  , headers : List String
  , selected : Set String
  , title : String
  , rowFn : (String -> a -> List Html)}

type Action a = 
  Select String
  | View String
  | SelectAll
  | UpdateRows (List (String, a))
  | NoOp

init : String -> Bool -> List String ->  (String -> a -> List Html) -> String -> Model a
init id caption hs f title =
   Model id caption [] hs Set.empty title f

-- Update

update : Action a ->  Model a -> Model a
update action ({selected, rows} as model) = 
  case action of
    UpdateRows rs ->
      { model | rows = rs, selected = Set.empty}

    SelectAll -> 
      let 
        all = Set.fromList (List.map (\(id, _) -> id) rows)
      in
        if (selected == all) then
         { model | selected = Set.empty }
        else 
         { model | selected = all }

    Select id ->
      if (Set.member id model.selected) then
        { model | selected = Set.remove id selected}
      else
        { model | selected = Set.insert id selected}

    _ -> model

-- View

headersMap : (List String) -> List Html
headersMap keys = 
  (List.map (\k ->  (th_ [text k])) keys)

applySelect : Signal.Address (Action a) -> Model a -> String -> List Html -> Html
applySelect address model id cols =
  let 
      background = if (Set.member id model.selected) then "#e7e7e7" else ""
  in
    tr [style [("background",background)], onClick address (Select id), onDoubleClick address (View id)] 
        cols
    
withCaption : Bool -> String -> List Html -> List Html
withCaption enabled title body =
  if enabled then
    List.append [caption [] [text title]] body
  else
    body

view : Signal.Address (Action a) -> Model a -> List Html
view address model =
  [table [class "table table-bordered", id model.id]
     (withCaption model.caption model.title 
        [ thead_
            [tr [onClick address SelectAll] (headersMap model.headers)]
        , tbody_
            (List.map (\(id, item) -> applySelect address model id (model.rowFn id item) ) model.rows)
        ])
  ]
