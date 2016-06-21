module Stacks.Core exposing (..)


import Html exposing (..)
import Stacks.Add as Add
import Nav.Common exposing (Active(Jobs), Section(Stats, Launch, Add, List, View))
import Common.Components exposing (asList, notImplemented)
import Debug

type alias Model = 
  {
    add : Add.Model 
  , navChange : Maybe (Active, Section)
  }
 
init : (Model , Effects Msg)
init =
  let
    (add, addEffects) = Add.init
    effects = [
      Effects.map StacksAdd addEffects
    ]
  in
   (Model add Nothing, Effects.batch effects)

-- Update 

type Msg = 
  NoOp
    | StacksAdd Add.Msg

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({add} as model) =
  case msg of 
    StacksAdd addMsg -> 
      let
        (newAdd, effects) = Add.update addMsg add
      in
        ({model | add = newAdd}, Effects.map StacksAdd effects)
    
    _ -> 
      (model, Effects.none)

-- View

view : Signal.Address Msg -> Model -> Section -> List Html
view model section =
  case section of
    Add ->
      asList (Add.view (Signal.forwardTo address StacksAdd) model.add)

    _ -> 
      asList notImplemented


loadTemplates ({add} as model) =
  let
   (newAdd, effects) = Add.update Add.LoadTemplates add
  in
   ({model | add = newAdd }, Effects.map StacksAdd effects)

