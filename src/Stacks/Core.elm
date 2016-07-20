module Stacks.Core exposing (..)


import Common.Utils exposing (none)
import Html exposing (..)
import Html.App as App
import Stacks.Add as Add
import Nav.Common exposing (Active(Jobs), Section(Stats, Launch, Add, List, View))
import Common.Components exposing (asList, notImplemented)
import Debug

type alias Model =
  {
    add : Add.Model
  , navChange : Maybe (Active, Section)
  }

init : (Model , Cmd Msg)
init =
  let
    (add, addEffects) = Add.init
    msgs = [
      Cmd.map StacksAdd addEffects
    ]
  in
   (Model add Nothing, Cmd.batch msgs)

-- Update

type Msg =
  NoOp
    | StacksAdd Add.Msg

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({add} as model) =
  case msg of
    StacksAdd addMsg ->
      let
        (newAdd, msgs) = Add.update addMsg add
      in
        ({model | add = newAdd}, Cmd.map StacksAdd msgs)

    _ ->
      none model

-- View

view : Model -> Section -> Html Msg
view model section =
  case section of
    Add ->
      (App.map StacksAdd (Add.view model.add))

    _ ->
      notImplemented


loadTemplates ({add} as model) =
  let
   (newAdd, msgs) = Add.update Add.LoadTemplates add
  in
   ({model | add = newAdd }, Cmd.map StacksAdd msgs)

