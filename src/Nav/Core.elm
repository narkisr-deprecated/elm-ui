module Nav.Core where

import Nav.Side as NavSide exposing (Active(Stacks, Types, Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Nav.Header as Header
import Nav.Side as Side

import Effects exposing (Effects)
import Html exposing (..)
import Common.Utils exposing (none)

type alias Model = 
  {
    side : NavSide.Model 
  , header : Header.Model 
  }
 
init : (Model , Effects Action)
init =
  let
    (header, headerAction) = Header.init
  in 
    (Model NavSide.init header, Effects.batch [Effects.map HeaderAction headerAction])

-- Update 

type Action = 
  SideAction NavSide.Action
   | HeaderAction Header.Action
   | NoOp


goto active section ({nav} as model) effects =
  let
    (newNav, _) = update (SideAction (NavSide.Goto active section)) nav
  in 
   ({model | nav = newNav }, effects)

update : Action ->  Model-> (Model , Effects Action)
update action ({side, header} as model) =
  case action of 
    SideAction navAction -> 
      let 
        newSide = NavSide.update navAction side
        -- (newModel, effects) = init
      in
       none { model | side = newSide }

    HeaderAction navAction -> 
      let 
        (newHeader, effects) = Header.update navAction header
      in
       ({ model | header = newHeader}, Effects.map HeaderAction effects)

    _ -> 
      none model

-- View

sideView address {side} = 
  Side.view (Signal.forwardTo address SideAction) side

headerView address {header} = 
  Header.view (Signal.forwardTo address HeaderAction) header

activeOf {side} = 
  side.active

section {side} = 
  side.section

