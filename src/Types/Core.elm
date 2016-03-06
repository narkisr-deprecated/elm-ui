module Types.Core where

import Html exposing (..)
import Types.List as TypesList
import Types.Add as TypesAdd
import Types.View as TypesView
import Nav.Side exposing (Section(Stats, Launch, Add, List, View), Active(Types))
import Effects exposing (Effects, Never, batch, map)
import Table as Table


type alias Model = 
  {
    list : TypesList.Model
  , add  : TypesAdd.Model
  , view : TypesView.Model
  , navChange : Maybe (Active, Section)
  }
  
init : (Model , Effects Action)
init =
   let
     (list, listAction)  = TypesList.init 
     (add, addAction)  = TypesAdd.init 
     (view, viewAction)  = TypesView.init 
     effects = [
        Effects.map Listing listAction
      , Effects.map Adding addAction
      , Effects.map Viewing viewAction
     ]
   in
     (Model list add view Nothing, Effects.batch effects) 

type Action = 
  Listing TypesList.Action
    | Adding TypesAdd.Action
    | Viewing TypesView.Action

update : Action ->  Model-> (Model , Effects Action)
update action ({list, add, view} as model) =
  case action of
    Listing action -> 
      case action of 
        TypesList.LoadPage (Table.View id) ->
          let 
            (newSystems, effects) = TypesView.update (TypesView.ViewType id) view
          in
           ({model | view = view, navChange = Just (Types, View)}, Effects.map Viewing effects)        

        _ -> 
          let 
            (newTypes, effect ) = TypesList.update action list
          in
            ({ model | list = newTypes }, Effects.map Listing effect)

    Adding action -> 
      let 
        (newTypes, effect ) = TypesAdd.update action add
      in
        ({ model | add = newTypes }, Effects.map Adding effect)

    Viewing action -> 
      let 
        (newTypes, effect ) = TypesView.update action view
      in
        ({ model | view = newTypes }, Effects.map Viewing effect)


view : Signal.Address Action -> Model -> Section -> List Html
view address ({list, add, view} as model) section =
   case section of
     List -> 
        TypesList.view (Signal.forwardTo address Listing) list

     Add -> 
        TypesAdd.view (Signal.forwardTo address Adding) add

     View -> 
        TypesView.view (Signal.forwardTo address Viewing) view


     _ -> 
       [div  [] [text "not implemented" ]]
