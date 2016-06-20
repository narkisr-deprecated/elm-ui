module Pager exposing (..)

import Bootstrap.Html exposing (..)

import Html.Shorthand exposing (..)
import Html.Shorthand.Type exposing (AnchorParam)
import Html exposing (..)
import Html.Attributes exposing (src, style , class)
import Html.Events exposing (onClick)
import Array
import Basics
import Debug

-- MODEL

type alias Model = 
  { total : Float 
  , page : Int 
  , offset : Float
  , maxButtons : Int 
  , slice : Int}

type Action = 
   NextPage Int 
     | UpdateTotal Float 
     | NoOp

init = 
    { total = 0 , page = 1, offset = 10, maxButtons = 5 , slice = 0}

-- Update

update : Action ->  Model-> Model
update action ({slice, maxButtons, page} as model) =
  case action of
    NextPage curr ->
      let 
        start = slice 
        end = slice + maxButtons
        newModel = { model |  page = curr}
      in
        if start < curr  && curr < end  then 
          newModel  -- page within current slice we stay put
        else if curr >= end && curr + maxButtons >= pageCount model then
          { newModel | slice = (curr - maxButtons) } -- last in view
        else if curr >= end then
          { newModel | slice = curr - 1 } -- single right move
        else if curr == 1  then
          { newModel | slice = 0} -- got to first
        else if curr <= start then
          { newModel | slice = curr - 1} -- single left move
        else 
          newModel

    UpdateTotal t ->
      if t < (toFloat page) then
        { model |  total = t, page = 1 } 
      else
        { model |  total = t, page = page } 

    NoOp -> 
      model

-- View

pageCount : Model -> Int
pageCount model = 
  model.total / model.offset |> Basics.ceiling

arrows : Signal.Address Action -> ((String,Int),  (String,Int)) -> Bool -> List Html
arrows address shapes active = 
  let
   operation p = if active then (NextPage p) else NoOp
   isActive = if active then "" else "disabled"
   ((firstShape,firstPos), (secondShape,secondPos)) = shapes
  in
  [li [class isActive] [a [onClick address (operation firstPos)]  [text firstShape]],
   li [class isActive] [a [onClick address (operation secondPos)]  [text secondShape]]]

pageLinks : Signal.Address Action -> Model -> List Html
pageLinks address ({maxButtons, slice} as model) =
  let 
    isActive page =
      if model.page == page then "active" else ""
    pageLink page = 
      li [class (isActive page)] [a [ onClick address (NextPage page)]  [text (toString page)]]
    next = 
      arrows address ((">", (model.page + 1)), (">>",(pageCount model))) (model.page < (pageCount model))  
    last = 
      arrows address (("<<",1), ("<" , (model.page - 1))) (model.page > 1)
    links =
      (Array.map (\p -> pageLink ( p + 1)) (Array.initialize (pageCount model) identity))
    sliced = Array.slice slice (slice + maxButtons) links
    windowed = 
      if (Array.length links) > maxButtons then 
        sliced 
      else links
  in
    List.concat [last, (Array.toList windowed), next]

view : Signal.Address Action -> Model -> Html
view address model = 
  p' { class = "text-center"} [
    nav_ 
    [ul' { class = "pagination" } 
      (pageLinks address model)
    ]
  ]
 

