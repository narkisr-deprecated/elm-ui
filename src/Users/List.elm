module Users.List where

import Effects exposing (Effects)
import Html exposing (..)
import Common.Utils exposing (none)
import Users.Model exposing (User, getUsers)
import Http exposing (Error(BadResponse))
import Html.Attributes exposing (class, id, style, attribute)
import Pager exposing (..)
import Common.Errors exposing (successHandler)
import Table
import String

import Html exposing (..)
import Bootstrap.Html exposing (..)


type alias Model = 
  { users : List User
  , table : Table.Model User
  , pager : Pager.Model
  } 

userRow : String -> User -> List Html
userRow name {roles, envs} = 
    [ td [] [ text (String.join " " roles) ]
    , td [] [ text (String.join " " envs)]
    ]
 
init : (Model, Effects Action)
init =
  let 
    table = Table.init "usersListing" True ["Name", "Roles", "Environments"] userRow "Users"
  in 
    (Model [] table Pager.init , getUsers SetUsers)


-- Update 

type Action = 
  SetUsers (Result Http.Error (List User))
    | GotoPage Pager.Action
    | LoadPage (Table.Action User)
    | NoOp

setUsers : Model -> List User -> (Model , Effects Action)
setUsers ({pager, table} as model) users = 
  let
    total = List.length users
    typePairs = List.map (\ ({username} as user) -> (username, user)) users
    newPager = (Pager.update (Pager.UpdateTotal (Basics.toFloat total)) pager)
    newTable = (Table.update (Table.UpdateRows typePairs) table)
  in
    none { model | users = users, pager = newPager, table = newTable }


update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
   SetUsers result ->
      successHandler result model (setUsers model) NoOp

   _ -> 
     none model

-- View

view : Signal.Address Action -> Model -> List Html
view address ({pager, table} as model) =
  [ div [class ""] [
    row_ [
       div [class "col-md-offset-1 col-md-10"] [
         panelDefault_ (Table.view (Signal.forwardTo address LoadPage) table)
       ]
    ]
  , row_ [(Pager.view (Signal.forwardTo address GotoPage) pager)]
  ]]
 
