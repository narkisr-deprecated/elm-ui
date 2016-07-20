port module Common.Editor exposing (..)

import Task

-- SIGNALS
type Msg =
  NoOp
  | Load (String, String)


port editorInPort : ((String, String) -> msg) -> Sub msg

port editorOutPort : (String, String) -> Cmd msg
