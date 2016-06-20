module Common.Redirect exposing (..)

import Signal exposing (Signal)
import Effects exposing (Effects)
import Debug
import Task

-- SIGNALS 
type Action = 
  NoOp 
    | To String

redirectActions : Signal.Mailbox Action
redirectActions =
  Signal.mailbox NoOp

redirect : a -> String -> Effects a
redirect noop dest = 
  (Signal.send redirectActions.address (To dest))
     |> Task.map (always noop)
     |> Effects.task 



