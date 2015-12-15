module Systems.Add.Common where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class, for, placeholder, attribute, type', checked, value, style)
import Html.Events exposing (onClick)

import Json.Decode as Json exposing (at, string)
import Systems.Add.Validations exposing (Error(Invalid,None))
import Maybe exposing (withDefault)

withError : List Error -> String -> String
withError errors class =
  if List.isEmpty errors then 
    class 
  else 
    class ++ " has-error"
        
toHtml : Error -> Html
toHtml error =
  case error of
    Invalid message -> 
      span [class "help-block"] [(text message)]
    None ->
      span [class "help-block"] []

withMessage : List Error -> Html 
withMessage errors = 
  if List.isEmpty errors then 
    div [] [] 
  else  
    let 
      messages = List.map toHtml errors
    in
      withDefault (div [] []) (List.head messages)
 
group : String -> Html -> List Error -> Html
group title widget errors = 
  div [class (withError errors "form-group")] 
    [ label [for title, class "col-sm-3 control-label"] [(text title)]
    , div [class "col-sm-6"] [widget]
    , withMessage errors]

group' : String -> Html -> Html
group' title widget = 
  group title widget []

selected : String -> String -> List Attribute
selected value default =
  if value == default then
    [attribute "selected" "true"]
  else 
    []

onSelect : Signal.Address a -> (String -> a) -> Attribute
onSelect address action = 
  Html.Events.on "change" (at ["target", "value"] string) (Signal.message address << action)

selector : Signal.Address a -> (String -> a) -> List String -> String -> Html
selector address action options default =
  select [class "form-control", onSelect address action ] 
    (List.map (\opt -> option (selected opt default) [text opt]) options)

onInput : Signal.Address a -> (String -> a) -> Attribute
onInput address action =
   Html.Events.on "input" (at ["target", "value"] string) (Signal.message address << action)


typedInput : Signal.Address a -> (String -> a) -> String -> String -> String -> Html
typedInput address action place currentValue typed =
  input 
    [ class "form-control"
    , type' typed
    , placeholder place
    , value currentValue
    , onInput address action
    ] []

inputNumber : Signal.Address a -> (String -> a) -> String -> String -> Html
inputNumber address action place currentValue =
  typedInput address action place currentValue "number"

inputText : Signal.Address a -> (String -> a) -> String -> String -> Html
inputText address action place currentValue =
  typedInput address action place currentValue "text"

checkbox : Signal.Address a -> a -> Bool -> Html
checkbox address action currentValue= 
   input [type' "checkbox", attribute "aria-label" "...", style [("margin","10px 0 0")], onClick address action, checked currentValue] []

