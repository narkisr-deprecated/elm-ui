module Common.Redirect where

import Signal exposing (Signal)
import Effects exposing (Effects)
import Debug
import Task

-- SIGNALS 
type Action = NoOp | Prompt

redirectActions : Signal.Mailbox Action
redirectActions =
  Signal.mailbox NoOp

redirect : a -> Effects a
redirect noop = 
  (Signal.send redirectActions.address Prompt)
     |> Task.map (always noop)
     |> Effects.task 



