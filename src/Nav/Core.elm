module Nav.Core exposing (..)

import Nav.Common as NavCommon exposing (Active(Stacks, Types, Systems, Jobs, Templates), Section(Stats, Launch, Add, List, View))
import Nav.Header as Header exposing (Msg(SetSession))
import Nav.Side as Side exposing (Msg(SetSession))
import Users.Session exposing (getSession, Session)
import Http exposing (Error(BadResponse))
import Common.Errors exposing (successHandler)

import Html exposing (..)
import Html.App as App
import Common.Utils exposing (none)

type alias Model = 
  {
    side : Side.Model 
  , header : Header.Model 
  , active : Active 
  , section : Section 
  }
 
init : (Model , Cmd Msg)
init =
  let
    (header, _) = Header.init
  in 
    (Model Side.init header Systems List , Effects.batch [getSession LoadSession])

-- Update 

type Msg = 
  SideMsg Side.Msg
   | HeaderMsg Header.Msg
   | LoadSession (Result Http.Error Session)
   | NoOp

--
-- goto active section ({nav} as model) msgs =
--   let
--     (newNav, _) = update (SideMsg (Side.Goto active section)) nav
--   in 
--    ({model | nav = newNav }, msgs)

setSession ({side, header} as model) session = 
  let 
    (newSide, _) = Side.update (Side.SetSession session) side
    (newHeader, _) = Header.update (Header.SetSession session) header
  in 
    none { model | side = newSide, header = newHeader }

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({side, header} as model) =
  case msg of 
    SideMsg navMsg ->  
       let 
         (newSide, _) = Side.update navMsg side
       in
         none { model | side = newSide }

    HeaderMsg navMsg -> 
      let 
        (newHeader, msgs) = Header.update navMsg header
      in
       ({ model | header = newHeader}, Cmd.map HeaderMsg msgs)

    LoadSession result -> 
      (successHandler result model (setSession model) NoOp)

    _ -> 
      none model

-- View

sideView {side} = 
  App.map SideMsg (Side.view side)

headerView {header} = 
  App.map HeaderMsg (Header.view header)


