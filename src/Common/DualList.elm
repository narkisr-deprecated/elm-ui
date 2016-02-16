module Common.DualList where

import Effects exposing (Effects)
import Html exposing (..)
import Task


type Action = 
  NoOp
    | Load (List String)

listActions : Signal.Mailbox Action
listActions =
  Signal.mailbox NoOp

loadList: a -> List String -> Effects a
loadList noop items = 
  (Signal.send listActions.address (Load items))
     |> Task.map (always noop)
     |> Effects.task 


