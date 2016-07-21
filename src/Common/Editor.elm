port module Common.Editor exposing (..)

-- SIGNALS
type Msg =
  NoOp
  | Load (String, String)


port editorInPort : ((String, String) -> msg) -> Sub msg

port editorOutPort : (String, String) -> Cmd msg

unloadEditor : Cmd msg 
unloadEditor = 
   editorOutPort ("unload", "")

loadEditor : String -> String -> Cmd msg
loadEditor target json = 
   editorOutPort (json, target)

