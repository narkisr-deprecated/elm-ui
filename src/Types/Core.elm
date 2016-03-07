module Types.Core where

import Html exposing (..)
import Types.List as TypesList
import Types.Add as TypesAdd
import Types.View as TypesView
import Types.Delete as TypesDelete
import Nav.Side exposing (Section(Add, List, View, Edit, Delete), Active(Types))
import Effects exposing (Effects, Never, batch, map)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none)
import Table as Table


type alias Model = 
  {
    list : TypesList.Model
  , add  : TypesAdd.Model
  , view : TypesView.Model
  , delete : TypesDelete.Model
  , navChange : Maybe (Active, Section)
  }
  
init : (Model , Effects Action)
init =
   let
     (list, listAction)  = TypesList.init 
     (add, addAction)  = TypesAdd.init 
     (view, viewAction)  = TypesView.init 
     (delete, deleteAction)  = TypesDelete.init 
     effects = [
        Effects.map Listing listAction
      , Effects.map Adding addAction
      , Effects.map Viewing viewAction
      , Effects.map Deleting deleteAction
     ]
   in
     (Model list add view delete Nothing, Effects.batch effects) 

type Action = 
  Listing TypesList.Action
    | SetupJob (String, String)
    | Adding TypesAdd.Action
    | Viewing TypesView.Action
    | Deleting TypesDelete.Action

navigate : Action -> (Model , Effects Action) -> (Model , Effects Action)
navigate action ((({list, add, view} as model), effects) as result) =
    case action of 
      Listing listing -> 
        case listing of 
          TypesList.LoadPage (Table.View id) ->
            let 
              (newSystems, effects) = TypesView.update (TypesView.ViewType id) view
            in
              ({model | view = view, navChange = Just (Types, View)}, Effects.map Viewing effects)        

          _ -> 
            (model, effects)

      Adding adding -> 
        case adding of 
          TypesAdd.Saved (Result.Ok _) -> 
             ({model | navChange = Just (Types, List)}, effects)

          _ -> 
            (model, effects)

      SetupJob (job,_) -> 
        case job of 
         "edit" -> 
            ({ model | navChange = Just (Types, Edit) }, effects)
          
         "clear" -> 
            ({ model | navChange = Just (Types, Delete) }, effects)

         _ -> 
           result
     
      _ -> 
        (model, effects)



route : Action ->  Model -> (Model , Effects Action)
route action ({list, add, view} as model) =
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

    Viewing action -> 
      let 
        (newTypes, effect ) = TypesView.update action view
      in
        ({ model | view = newTypes }, Effects.map Viewing effect)

    _ -> 
      none model


update : Action ->  Model-> (Model , Effects Action)
update action ({list, add, view} as model) =
  navigate action (route action model)

view : Signal.Address Action -> Model -> Section -> List Html
view address ({list, add, view, delete} as model) section =
   case section of
     List -> 
        TypesList.view (Signal.forwardTo address Listing) list

     Add -> 
        TypesAdd.view (Signal.forwardTo address Adding) add

     View -> 
        TypesView.view (Signal.forwardTo address Viewing) view

     Delete -> 
        TypesDelete.view (Signal.forwardTo address Deleting) delete

     _ -> 
       [div  [] [text "not implemented" ]]
