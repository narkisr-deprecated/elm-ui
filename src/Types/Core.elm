module Types.Core exposing (..)

import Html exposing (..)
import Types.List as TypesList
import Types.Add as TypesAdd
import Types.View as TypesView
import Types.Edit as TypesEdit
import Types.Delete as TypesDelete
import Nav.Common exposing (Section(Add, List, View, Edit, Delete), Active(Types))
import Platform.Cmd exposing (batch, map)
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
  
init : (Model , Effects Msg)
init =
   let
     (list, listMsg)  = TypesList.init 
     (add, addMsg)  = TypesAdd.init 
     (view, viewMsg)  = TypesView.init 
     (edit, editMsg)  = TypesEdit.init 
     (delete, deleteMsg)  = TypesDelete.init 
     effects = [
        Effects.map Listing listMsg
      , Effects.map Adding addMsg
      , Effects.map Viewing viewMsg
      , Effects.map Deleting deleteMsg
      , Effects.map Editing editMsg
     ]
   in
     (Model list add view delete edit Nothing, Effects.batch effects) 

type Msg = 
  Listing TypesList.Msg
    | MenuClick (String, String)
    | Adding TypesAdd.Msg
    | Viewing TypesView.Msg
    | Deleting TypesDelete.Msg
    | Editing TypesEdit.Msg

navigate : Msg -> (Model , Effects Msg) -> (Model , Effects Msg)
navigate msg ((({list, add, view, delete, edit} as model), effects) as result) =
    case msg of 
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
          TypesEdit.AddMsg addMsg -> 
            case addMsg of
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


route : Msg ->  Model -> (Model , Effects Msg)
route msg ({list, add, view, delete, edit} as model) =
  case msg of
    Listing msg -> 
      let 
        (newTypes, effect ) = TypesList.update msg list
      in
        ({ model | list = newTypes }, Effects.map Listing effect)

    Adding msg -> 
      let 
        (newTypes, effect ) = TypesAdd.update msg add
      in
        ({ model | add = newTypes }, Effects.map Adding effect)

    Editing msg -> 
      let 
        (newTypes, effect ) = TypesEdit.update msg edit
      in
        ({ model | edit = newTypes }, Effects.map Editing effect)

    Viewing msg -> 
      let 
        (newTypes, effect ) = TypesView.update msg view
      in
        ({ model | view = newTypes }, Effects.map Viewing effect)

    Deleting msg -> 
      let 
        (newDelete, effects) = (TypesDelete.update msg delete)
        success = (succeeded msg TypesDelete.Deleted "Type deleted")
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

update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  navigate msg (route msg model)

view : Signal.Address Msg -> Model -> Route -> List Html
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
