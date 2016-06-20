module Types.Edit exposing (..)

import Http exposing (Error(BadResponse))

import Common.Components exposing (asList)
import Common.Utils exposing (none)
import Html exposing (..)
import Types.Add as Add exposing (Action(FormAction, Save, LoadEditor), updateType)
import Types.View as View
import Types.Model as Model exposing (Type, PuppetStd, emptyType)
import Common.Errors exposing (successHandler)
import Maybe exposing (withDefault)

import Form.Error as Error exposing (..)
import Form.Field as Field exposing (..)
import Form exposing (Action(..))
import Task exposing (Task)


type alias Model = 
  {
    add : Add.Model
  , name : String
  , type' : Type
  }
 
init : (Model , Effects Action)
init =
  let 
    (add, effects) = Add.init
  in 
    (Model add "" emptyType, Effects.map AddAction effects)

-- Update 

type Action = 
  NoOp
   | AddAction Add.Action 
   | LoadType String
   | ViewAction View.Action
   | SetType (Result Http.Error Type)
   | SetClasses String

setType : Model -> Type -> (Model , Effects Action)
setType ({add} as model) type' =
  let
    env = withDefault "" (List.head (add.environments))
  in 
    none {model | type' = type', add = Add.reinit add type' env}

envChange action ({type', add} as model) = 
  case action of 
    (FormAction (Input "environment" (Select env))) -> 
      {model | type' = type', add = Add.reinit add type' env}

    _ -> 
      model

update : Action ->  Model-> (Model , Effects Action)
update action ({add} as model) =
  case action of 
    AddAction addAction -> 
      case addAction of 
        Save _ -> 
          let 
            (newAdd, effects) = Add.update (Save updateType) add
          in
            ({ model | add = newAdd }, Effects.map AddAction effects)

        LoadEditor _ -> 
          let 
            (newAdd, effects) = Add.update (LoadEditor "typesEdit") add
          in
            ({ model | add = newAdd }, Effects.map AddAction effects)

        _ -> 
          let 
            (newAdd, effects) = Add.update addAction add
          in 
            (envChange addAction { model | add = newAdd }, Effects.map AddAction effects)

    LoadType name -> 
       (model, View.getType name SetType)

    SetType result -> 
      successHandler result model (setType model) NoOp
 
    _ -> 
      none model

-- View

view : Signal.Address Action -> Model -> List Html
view address model =
  Add.view (Signal.forwardTo address AddAction) model.add

