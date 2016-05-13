module Types.Core where

import Html exposing (..)
import Types.List as TypesList
import Types.Add as TypesAdd
import Types.View as TypesView
import Types.Edit as TypesEdit
import Types.Delete as TypesDelete
import Nav.Common exposing (Section(Add, List, View, Edit, Delete), Active(Types))
import Effects exposing (Effects, Never, batch, map)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none)
import Common.Delete exposing (refresh, succeeded)
import Table as Table

-- Routing
import Types.Routing as Routing exposing (Route)

type alias Model = 
  {
    list : TypesList.Model
  , add  : TypesAdd.Model
  , view : TypesView.Model
  , delete : TypesDelete.Model
  , edit : TypesEdit.Model
  , navChange : Maybe String
  }
  
init : (Model , Effects Action)
init =
   let
     (list, listAction)  = TypesList.init 
     (add, addAction)  = TypesAdd.init 
     (view, viewAction)  = TypesView.init 
     (edit, editAction)  = TypesEdit.init 
     (delete, deleteAction)  = TypesDelete.init 
     effects = [
        Effects.map Listing listAction
      , Effects.map Adding addAction
      , Effects.map Viewing viewAction
      , Effects.map Deleting deleteAction
      , Effects.map Editing editAction
     ]
   in
     (Model list add view delete edit Nothing, Effects.batch effects) 

type Action = 
  Listing TypesList.Action
    | MenuClick (String, String)
    | Adding TypesAdd.Action
    | Viewing TypesView.Action
    | Deleting TypesDelete.Action
    | Editing TypesEdit.Action

navigate : Action -> (Model , Effects Action) -> (Model , Effects Action)
navigate action ((({list, add, view, delete, edit} as model), effects) as result) =
    case action of 
      Listing listing -> 
        case listing of 
          TypesList.LoadPage (Table.View id) ->
            let 
              (newSystems, effects) = TypesView.update (TypesView.ViewType id) view
            in
              ({model | view = view, navChange = Just ("/types/view/" ++ id)}, Effects.map Viewing effects)        

          _ -> 
            (model, effects)

      Adding adding -> 
        case adding of 
          TypesAdd.Saved (Result.Ok _) -> 
            refreshList True ({model | navChange = Just "/types/list"}, effects)

          _ -> 
            (model, effects)

      Editing editing -> 
        case editing of 
          TypesEdit.AddAction addAction -> 
            case addAction of
              TypesAdd.Saved (Result.Ok _) -> 
                 refreshList True ({model | navChange = Just "/types/list"}, effects)

              _ -> 
               (model, effects)


          _ -> 
            (model, effects)


      Deleting deleting -> 
        case deleting of 
           TypesDelete.Deleted _  -> 
            if delete.errorMsg == "" then
              ({ model | navChange = Just "/types/list"}, effects)
            else
              result

           TypesDelete.Cancel -> 
             refreshList True ({ model | navChange = Just "/types/list"}, effects)

           TypesDelete.Done -> 
             refreshList True ({ model | navChange = Just "/types/list"}, effects)
         
           _ -> 
            result

      MenuClick (job,name) -> 
        case job of 
         "edit" -> 
            ({ model | navChange = Just ("/types/edit/" ++ name)}, effects)
          
         "clear" -> 
            ({ model | navChange = Just ("/types/delete/" ++ name)}, effects)

         _ -> 
           result
     
      _ -> 
        (model, effects)

refreshList = 
  refresh TypesList.init Listing

setName model name = 
  { model | name = name } 


route : Action ->  Model -> (Model , Effects Action)
route action ({list, add, view, delete, edit} as model) =
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

    Editing action -> 
      let 
        (newTypes, effect ) = TypesEdit.update action edit
      in
        ({ model | edit = newTypes }, Effects.map Editing effect)

    Viewing action -> 
      let 
        (newTypes, effect ) = TypesView.update action view
      in
        ({ model | view = newTypes }, Effects.map Viewing effect)

    Deleting action -> 
      let 
        (newDelete, effects) = (TypesDelete.update action delete)
        success = (succeeded action TypesDelete.Deleted "Type deleted")
      in
        refreshList success ({ model | delete = newDelete } , Effects.map Deleting effects)

    MenuClick (job, name) -> 
      case job of
        "clear" -> 
           none { model | delete = setName delete name }
           
        "edit" -> 
          let
            (newEdit, effects) = TypesEdit.update (TypesEdit.LoadType name) edit
          in 
            ({ model | edit = newEdit }, Effects.map Editing effects)
         
        _ -> 
          none model

update : Action ->  Model-> (Model , Effects Action)
update action model =
  navigate action (route action model)

view : Signal.Address Action -> Model -> Route -> List Html
view address ({list, add, view, delete, edit} as model) section =
   case section of
     Routing.List -> 
        TypesList.view (Signal.forwardTo address Listing) list

     Routing.Add -> 
        TypesAdd.view (Signal.forwardTo address Adding) add

     Routing.Edit _ -> 
        TypesEdit.view (Signal.forwardTo address Editing) edit

     Routing.View _ -> 
        TypesView.view (Signal.forwardTo address Viewing) view

     Routing.Delete _ -> 
        TypesDelete.view (Signal.forwardTo address Deleting) delete
