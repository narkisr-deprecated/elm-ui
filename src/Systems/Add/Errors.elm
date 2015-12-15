module Systems.Add.Errors where

import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Effects exposing (Effects, batch)

import Common.Redirect as Redirect
import Systems.Add.Common exposing (..)
import Dict exposing (Dict)

type alias Model = 
  {errors : Redirect.Errors}

init : (Model , Effects Action)
init =
  (Model (Redirect.Errors "" Dict.empty), Effects.none)

type Action = 
  NoOp

mapValues : (comparable -> a -> b) -> Dict comparable a -> List b
mapValues f d =
  Dict.values (Dict.map f d)

nestedSection : String -> Dict String String -> Html
nestedSection key errors =
  div [] [
    text key 
  , ul [] (mapValues (\k v -> li [][text ( k ++ ": " ++ v)]) errors)
  ]

deepNestedList : String -> List (Dict String (Dict String String)) -> Html
deepNestedList prop nested =
  div [] 
   (List.concat
     (List.map 
       (\parent -> mapValues (\key errors -> (nestedSection (prop ++ "." ++ key) errors)) parent) nested))

nestedList : String -> (List (Dict String String)) -> Html
nestedList prop nested =
  div [] (List.map (\section -> (nestedSection prop section))  nested)
     
toText : String -> Redirect.Error -> Html
toText key error =
  case error of 
    Redirect.Nested errors ->
       nestedSection key errors

    Redirect.DeepNestedList errors ->
      div [] 
        (mapValues (\prop nested -> deepNestedList (key++ "." ++ prop) nested) errors)

    Redirect.NestedList errors ->
      div [] 
        (mapValues (\prop nested -> nestedList (key++ "." ++ prop) nested) errors)

    Redirect.Value error -> 
      text (key ++ ": " ++ error)

view : Signal.Address Action -> Model -> List Html
view address ({errors} as model) =
  panelContents "Errors" 
    (div  [] 
      [  h4 [] [text "The following errors found (please move back and fix them):"]
      ,  ul [style [("list-style-type", "none")]]
             (Dict.values (Dict.map (\k v -> li [] [toText k v] ) errors.keyValues))
      ] 
    )
