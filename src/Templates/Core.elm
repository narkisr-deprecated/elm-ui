module Templates.Core where

import String
import Common.Utils exposing (none)
import Effects exposing (Effects)
import Html exposing (..)
import Templates.Add as Add
import Systems.Add as SystemsAdd
import Nav.Side as NavSide exposing (Section(Stats, Launch, Add, List, View))

type alias Model = 
  { 
   add : Add.Model
  }

init : (Model , Effects Action)
init =
  let
    (add, _) = Add.init
  in
    none (Model add)

type Action = 
  TemplatesAdd Add.Action
    | NoOp
    | SetSystem SystemsAdd.Model

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
    -- SetSystem system -> 
    --   (Add.update Add.SetSystem system)
    --
    _ -> 
      none model 

view : Signal.Address Action -> Model -> Section -> List Html
view address model section =
  case section of
    Add ->
      Add.view (Signal.forwardTo address TemplatesAdd) model.add

    _ -> 
     [div  [] [text "not implemented"]]
 
