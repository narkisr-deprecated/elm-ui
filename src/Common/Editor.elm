module Common.Editor exposing (..)

import Signal exposing (Signal)
import Effects exposing (Effects)
import Task

-- SIGNALS 
type Action = 
  NoOp 
  | Load (String, String)

editorActions : Signal.Mailbox Action
editorActions =
  Signal.mailbox NoOp

loadEditor : String-> a -> String -> Effects a
loadEditor target noop json = 
  (Signal.send editorActions.address (Load (json, target)))
     |> Task.map (always noop)
     |> Effects.task 

unloadEditor : a -> Effects a
unloadEditor noop = 
  (Signal.send editorActions.address (Load ("unload", "")))
     |> Task.map (always noop)
     |> Effects.task 


