module Common.NewTab where

import Signal exposing (Signal)
import Effects exposing (Effects)
import Task

-- SIGNALS 
type Action = 
  NoOp 
  | Open(String)

newtabActions : Signal.Mailbox Action
newtabActions =
  Signal.mailbox NoOp

newtab : a -> String -> Effects a
newtab noop url = 
  (Signal.send newtabActions.address (Open url))
     |> Task.map (always noop)
     |> Effects.task 


