module Common.Wizard exposing (..)


import Html exposing (..)
import Common.Utils exposing (withDefaultProp, defaultEmpty)
import Maybe exposing (withDefault)
import Debug


type alias Model a = 
  {
    zero :  a
  , step : a
  , default : a
  , prev : List a
  , next : List a
  }
 
init : a -> a -> List a -> Model a 
init zero default steps =
   Model zero zero default [] steps

-- Update 

type Msg = 
  Next 
    | Back
    | NoOp

update : Bool -> Msg ->  Model a -> Model a 
update noErrors msg ({next, prev, default, zero, step} as model)  =
  case msg of 
    Next -> 
      let
        nextStep = withDefault default (List.head next)
        nextSteps = defaultEmpty (List.tail next)
        prevSteps = if step /= zero then List.append prev [step] else prev
      in
        if noErrors then
           {model | step = nextStep, next = nextSteps, prev = prevSteps}
        else 
           model

    Back -> 
      let
        prevStep = withDefault zero (List.head (List.reverse prev))
        prevSteps = List.take ((List.length prev) - 1) prev
        nextSteps = if step /= zero then List.append [step] next else next
      in
        if noErrors then
          {model | step = prevStep, next = nextSteps, prev = prevSteps}
        else 
          model

    NoOp -> 
      model

-- View

view : Model a -> Html Msg
view model =
  div [] [
  ]

hasNext : {r | wizard : Model a} -> Bool
hasNext {wizard} =
  not (List.isEmpty wizard.next)

hasPrev : {r | wizard : Model a} -> Bool
hasPrev {wizard}  =
  not (List.isEmpty wizard.prev)


