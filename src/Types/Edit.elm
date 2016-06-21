module Types.Edit exposing (..)

import Http exposing (Error(BadResponse))

import Common.Components exposing (asList)
import Common.Utils exposing (none)
import Html exposing (..)
import Types.Add as Add exposing (Msg(FormMsg, Save, LoadEditor), updateType)
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
 
init : (Model , Effects Msg)
init =
  let 
    (add, effects) = Add.init
  in 
    (Model add "" emptyType, Effects.map AddMsg effects)

-- Update 

type Msg = 
  NoOp
   | AddMsg Add.Msg 
   | LoadType String
   | ViewMsg View.Msg
   | SetType (Result Http.Error Type)
   | SetClasses String

setType : Model -> Type -> (Model , Effects Msg)
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
            (newAdd, effects) = Add.update (Save updateType) add
          in
            ({ model | add = newAdd }, Effects.map AddMsg effects)

        LoadEditor _ -> 
          let 
            (newAdd, effects) = Add.update (LoadEditor "typesEdit") add
          in
            ({ model | add = newAdd }, Effects.map AddMsg effects)

        _ -> 
          let 
            (newAdd, effects) = Add.update addMsg add
          in 
            (envChange addMsg { model | add = newAdd }, Effects.map AddMsg effects)

    LoadType name -> 
       (model, View.getType name SetType)

    SetType result -> 
      successHandler result model (setType model) NoOp
 
    _ -> 
      none model

-- View

view : Signal.Address Msg -> Model -> List Html
view model =
  Add.view (Signal.forwardTo address AddMsg) model.add

