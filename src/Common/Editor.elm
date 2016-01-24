module Common.Editor where

import Signal exposing (Signal)
import Effects exposing (Effects)
import Task

-- SIGNALS 
type Action = 
  NoOp 
  | Load String

editorActions : Signal.Mailbox Action
editorActions =
  Signal.mailbox NoOp

loadEditor : a -> String -> Effects a
loadEditor noop json = 
  (Signal.send editorActions.address (Load json))
     |> Task.map (always noop)
     |> Effects.task 


