module Common.Wizard where

import Effects exposing (Effects)
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

type Action = 
  Next 
    | Back
    | NoOp

update : Bool -> Action ->  Model a -> Model a 
update noErrors action ({next, prev, default, zero, step} as model)  =
  case action of 
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

view : Signal.Address Action -> Model a -> Html
view address model =
  div [] [
  ]
