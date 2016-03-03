module Common.Editor where

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

loadEditor : a -> String -> Effects a
loadEditor noop json = 
  (Signal.send editorActions.address (Load (json, "")))
     |> Task.map (always noop)
     |> Effects.task 

getEditor : String -> a -> Effects a
getEditor target noop = 
  (Signal.send editorActions.address (Load ("get", target)))
     |> Task.map (always noop)
     |> Effects.task 

unloadEditor : a -> Effects a
unloadEditor noop = 
  (Signal.send editorActions.address (Load ("unload", "")))
     |> Task.map (always noop)
     |> Effects.task 


