module Types.Edit exposing (..)

import Http exposing (Error(BadResponse))

import Common.Components exposing (asList)
import Common.Utils exposing (none)
import Html exposing (..)
import Html.App as App
import Types.Add as Add exposing (Msg(FormMsg, Save), updateType)
import Types.View as View
import Types.Model as Model exposing (Type, PuppetStd, emptyType)
import Common.Errors exposing (successHandler)
import Maybe exposing (withDefault)

import Form.Error as Error exposing (..)
import Form.Field as Field exposing (..)
import Form exposing (Msg(..))
import Task exposing (Task)


type alias Model = 
  {
    add : Add.Model
  , name : String
  , type' : Type
  }
 
init : (Model , Cmd Msg)
init =
  let 
    (add, msgs) = Add.init
  in 
    (Model add "" emptyType, Cmd.map AddMsg msgs)

-- Update 

type Msg = 
  NoOp
   | AddMsg Add.Msg 
   | LoadType String
   | ViewMsg View.Msg
   | SetType (Result Http.Error Type)
   | SetClasses String

setType : Model -> Type -> (Model , Cmd Msg)
setType ({add} as model) type' =
  let
    env = withDefault "" (List.head (add.environments))
  in 
    none {model | type' = type', add = Add.reinit add type' env}

envChange msg ({type', add} as model) = 
  case msg of 
    (FormMsg (Input "environment" (Select env))) -> 
      {model | type' = type', add = Add.reinit add type' env}

    _ -> 
      model

update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({add} as model) =
  case msg of 
    AddMsg addMsg -> 
      case addMsg of 
        Save _ -> 
          let 
            (newAdd, msgs) = Add.update (Save updateType) add
          in
            ({ model | add = newAdd }, Cmd.map AddMsg msgs)

        -- LoadEditor _ -> 
        --   let 
        --     (newAdd, msgs) = Add.update (LoadEditor "typesEdit") add
        --   in
        --     ({ model | add = newAdd }, Cmd.map AddMsg msgs)
        --
        _ -> 
          let 
            (newAdd, msgs) = Add.update addMsg add
          in 
            (envChange addMsg { model | add = newAdd }, Cmd.map AddMsg msgs)

    LoadType name -> 
       (model, View.getType name SetType)

    SetType result -> 
      successHandler result model (setType model) NoOp
 
    _ -> 
      none model

-- View

view : Model -> Html Msg
view model =
  App.map AddMsg (Add.view model.add)

