module Nav.Core exposing (..)

import Nav.Common as NavCommon exposing (Active(Stacks, Types, Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Nav.Header as Header exposing (Action(SetSession))
import Nav.Side as Side exposing (Action(SetSession))
import Users.Session exposing (getSession, Session)
import Http exposing (Error(BadResponse))
import Common.Errors exposing (successHandler)
import Effects exposing (Effects)
import Html exposing (..)
import Common.Utils exposing (none)

type alias Model = 
  {
    side : Side.Model 
  , header : Header.Model 
  , active : Active 
  , section : Section 
  }
 
init : (Model , Effects Action)
init =
  let
    (header, _) = Header.init
  in 
    (Model Side.init header Systems List , Effects.batch [getSession LoadSession])

-- Update 

type Action = 
  SideAction Side.Action
   | HeaderAction Header.Action
   | LoadSession (Result Http.Error Session)
   | NoOp

--
-- goto active section ({nav} as model) effects =
--   let
--     (newNav, _) = update (SideAction (Side.Goto active section)) nav
--   in 
--    ({model | nav = newNav }, effects)

setSession ({side, header} as model) session = 
  let 
    (newSide, _) = Side.update (Side.SetSession session) side
    (newHeader, _) = Header.update (Header.SetSession session) header
  in 
    none { model | side = newSide, header = newHeader }

update : Action ->  Model-> (Model , Effects Action)
update action ({side, header} as model) =
  case action of 
    SideAction navAction ->  
       let 
         (newSide, _) = Side.update navAction side
       in
         none { model | side = newSide }

    HeaderAction navAction -> 
      let 
        (newHeader, effects) = Header.update navAction header
      in
       ({ model | header = newHeader}, Effects.map HeaderAction effects)

    LoadSession result -> 
      (successHandler result model (setSession model) NoOp)

    _ -> 
      none model

-- View

sideView address {side} = 
  Side.view (Signal.forwardTo address SideAction) side

headerView address {header} = 
  Header.view (Signal.forwardTo address HeaderAction) header


