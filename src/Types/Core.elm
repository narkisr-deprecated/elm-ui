module Types.Core where

import Html exposing (..)
import Types.List as TypesList
import Types.Add as TypesAdd
import Nav.Side exposing (Section(Stats, Launch, Add, List, View))
import Effects exposing (Effects, Never, batch, map)


type alias Model = 
  {
    list : TypesList.Model
  , add  : TypesAdd.Model
  }
  
init : (Model , Effects Action)
init =
   let
     (list, listAction)  = TypesList.init 
     (add, addAction)  = TypesAdd.init 
     effects = [ Effects.map Listing listAction , Effects.map Adding addAction]
   in
     (Model list add, Effects.batch effects) 

type Action = 
  Listing TypesList.Action
    | Adding TypesAdd.Action

update : Action ->  Model-> (Model , Effects Action)
update action ({list, add} as model) =
  case action of
    Listing action -> 
      let 
        (newTypes, effect ) = TypesList.update action list
      in
        ({ model | list = newTypes }, Effects.map Listing effect)

    Adding action -> 
      let 
        (newTypes, effect ) = TypesAdd.update action add
      in
        ({ model | add = newTypes }, Effects.map Adding effect)


view : Signal.Address Action -> Model -> Section -> List Html
view address ({list, add} as model) section =
   case section of
     List -> 
        TypesList.view (Signal.forwardTo address Listing) list

     Add -> 
        TypesAdd.view (Signal.forwardTo address Adding) add

     _ -> 
       [div  [] [text "not implemented" ]]
