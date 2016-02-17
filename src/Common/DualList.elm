module Common.DualList where

import Effects exposing (Effects)
import Html exposing (..)
import Task


type Action = 
  NoOp
    | Load 

listActions : Signal.Mailbox Action
listActions =
  Signal.mailbox NoOp

loadList: a -> Effects a
loadList noop = 
  (Signal.send listActions.address Load)
     |> Task.map (always noop)
     |> Effects.task 


