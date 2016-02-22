module Common.Components where

import Html.Attributes exposing (class, style)
import Html exposing (..)
import Html.Events exposing (onClick)
import Bootstrap.Html exposing (..)
import Html.Attributes exposing (class, for, placeholder, attribute, type', checked, value, style, id)
import Systems.Add.Validations exposing (Error(Invalid,None))
import Json.Decode as Json exposing (at, string, list)
import Maybe exposing (withDefault)
import Common.Utils exposing (defaultEmpty)
import Dict exposing (Dict)

notImplemented = 
  div [] [
    text "not implemented"
  ]

fixedSize height = 
  style [
    ("height","auto !important")
  , ("overflow", "auto")
  , ("min-height", height)
  , ("height", height)
  ]

panelContents body =
  div [class "panel-body"] [
    body
  ] 
   
panel body = 
   div [class "panel panel-default"] [
      body
   ]

asList body = 
  [body]

fixedPanel body = 
  div [class "panel-body" , (fixedSize "550px")] [
    body
  ] 

dianlogButtons address cancel ok =
  row_ [
     div [class "text-center"] [
       div [class "btn-group col-md-offset-5 col-md-10"] [
           button [class "btn btn-danger btn-sm col-md-1 col-md-offset-1", onClick address cancel ] [
            text (toString cancel)
          ]
       ,  button [class "btn btn-primary btn-sm col-md-1", onClick address ok ][
           text (toString ok) 
         ]
      ]
    ]
  ]

callout type' message =
  div [class "col-md-offset-1 col-md-10"] [
    div [ class ("callout callout-" ++ type') ] message
  ]

dialogPanel : String -> List Html -> Html -> List Html
dialogPanel type' message body = 
  [ row_ [
      callout type' message
    ] 
  , row_ [
      div [class "col-md-offset-1 col-md-10"] [
        body
      ]
    ]
  ]

withButtons address cancel ok panel = 
  List.append panel (asList (dianlogButtons address cancel ok))

infoCallout address message body cancel ok = 
  dialogPanel "info" message body
    |> withButtons address cancel ok

dangerCallout address message body cancel ok = 
  dialogPanel "danger" message body 
    |> withButtons address cancel ok

warningCallout address message body cancel ok = 
  dialogPanel "warning" message body
    |> withButtons address cancel ok

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
  div [class (withError errors "form-group"), id title] 
    [ label [for title, class "col-sm-3 control-label"] [(text title)]
    , div [class "col-sm-6"] [widget]
    , withMessage errors
    ]

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

onMultiSelect : Signal.Address a -> (String -> a) -> Attribute
onMultiSelect address action = 
  Html.Events.on "change" (at ["target"] string) 
    (\str -> Debug.log str ((Signal.message address << action) str))


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

withErrors : Dict String (List Error) -> String ->  Html -> Html
withErrors errors key widget =
  group key widget (defaultEmpty (Dict.get key errors))

message title content =
  [ h4 [] [ text title ]
  , span [] [ text content ]
  ]

info msg =
    message "Info" msg

error msg = 
   message "Error!" msg
