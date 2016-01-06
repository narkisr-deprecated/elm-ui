module Types.Core where

import Html exposing (..)
import Types.List as TypesList
import Types.Add as TypesAdd
import Nav.Side exposing (Section(Stats, Launch, Add, List, View))
import Effects exposing (Effects, Never, batch, map)


type alias Model = 
  {
    typesList : TypesList.Model
  , typesAdd  : TypesAdd.Model
  }
  
init : (Model , Effects Action)
init =
   let
     (typesList, typesListAction)  = TypesList.init 
     (typesAdd, typesAddAction)  = TypesAdd.init 
     effects = [ Effects.map TypesListing typesListAction , Effects.map TypesAdding typesAddAction]
   in
     (Model typesList typesAdd, Effects.batch effects) 

type Action = 
  TypesListing TypesList.Action
    | TypesAdding TypesAdd.Action

update : Action ->  Model-> (Model , Effects Action)
update action ({typesList, typesAdd} as model) =
  case action of
    TypesListing action -> 
      let 
        (newTypes, effect ) = TypesList.update action typesList
      in
        ({ model | typesList = newTypes }, Effects.map TypesListing effect)

    TypesAdding action -> 
      let 
        (newTypes, effect ) = TypesAdd.update action typesAdd
      in
        ({ model | typesAdd = newTypes }, Effects.map TypesAdding effect)


view : Signal.Address Action -> Model -> Section -> List Html
view address model section =
   case section of
     List -> 
        TypesList.view (Signal.forwardTo address TypesListing) model.typesList

     Add -> 
        TypesAdd.view (Signal.forwardTo address TypesAdding) model.typesAdd

     _ -> 
       [div  [] [text "not implemented" ]]
