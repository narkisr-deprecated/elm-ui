module Types.Core exposing (..)

import Html exposing (..)
import Html.App as App
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
  
init : (Model , Cmd Msg)
init =
   let
     (list, listMsg)  = TypesList.init 
     (add, addMsg)  = TypesAdd.init 
     (view, viewMsg)  = TypesView.init 
     (edit, editMsg)  = TypesEdit.init 
     (delete, deleteMsg)  = TypesDelete.init 
     msgs = [
        Cmd.map Listing listMsg
      , Cmd.map Adding addMsg
      , Cmd.map Viewing viewMsg
      , Cmd.map Deleting deleteMsg
      , Cmd.map Editing editMsg
     ]
   in
     (Model list add view delete edit Nothing, Cmd.batch msgs) 

type Msg = 
  Listing TypesList.Msg
    | MenuClick (String, String)
    | Adding TypesAdd.Msg
    | Viewing TypesView.Msg
    | Deleting TypesDelete.Msg
    | Editing TypesEdit.Msg

navigate : Msg -> (Model , Cmd Msg) -> (Model , Cmd Msg)
navigate msg ((({list, add, view, delete, edit} as model), msgs) as result) =
    case msg of 
      Listing listing -> 
        case listing of 
          TypesList.LoadPage (Table.View id) ->
            let 
              (newSystems, msgs) = TypesView.update (TypesView.ViewType id) view
            in
              ({model | view = view, navChange = Just ("/types/view/" ++ id)}, Cmd.map Viewing msgs)        

          _ -> 
            (model, msgs)

      Adding adding -> 
        case adding of 
          TypesAdd.Saved (Result.Ok _) -> 
            refreshList True ({model | navChange = Just "/types/list"}, msgs)

          _ -> 
            (model, msgs)

      Editing editing -> 
        case editing of 
          TypesEdit.AddMsg addMsg -> 
            case addMsg of
              TypesAdd.Saved (Result.Ok _) -> 
                 refreshList True ({model | navChange = Just "/types/list"}, msgs)

              _ -> 
               (model, msgs)


          _ -> 
            (model, msgs)


      Deleting deleting -> 
        case deleting of 
           TypesDelete.Deleted _  -> 
            if delete.errorMsg == "" then
              ({ model | navChange = Just "/types/list"}, msgs)
            else
              result

           TypesDelete.Cancel -> 
             refreshList True ({ model | navChange = Just "/types/list"}, msgs)

           TypesDelete.Done -> 
             refreshList True ({ model | navChange = Just "/types/list"}, msgs)
         
           _ -> 
            result

      MenuClick (job,name) -> 
        case job of 
         "edit" -> 
            ({ model | navChange = Just ("/types/edit/" ++ name)}, msgs)
          
         "clear" -> 
            ({ model | navChange = Just ("/types/delete/" ++ name)}, msgs)

         _ -> 
           result
     
      _ -> 
        (model, msgs)

refreshList = 
  refresh TypesList.init Listing

setName model name = 
  { model | name = name } 


route : Msg ->  Model -> (Model , Cmd Msg)
route msg ({list, add, view, delete, edit} as model) =
  case msg of
    Listing msg -> 
      let 
        (newTypes, effect ) = TypesList.update msg list
      in
        ({ model | list = newTypes }, Cmd.map Listing effect)

    Adding msg -> 
      let 
        (newTypes, effect ) = TypesAdd.update msg add
      in
        ({ model | add = newTypes }, Cmd.map Adding effect)

    Editing msg -> 
      let 
        (newTypes, effect ) = TypesEdit.update msg edit
      in
        ({ model | edit = newTypes }, Cmd.map Editing effect)

    Viewing msg -> 
      let 
        (newTypes, effect ) = TypesView.update msg view
      in
        ({ model | view = newTypes }, Cmd.map Viewing effect)

    Deleting msg -> 
      let 
        (newDelete, msgs) = (TypesDelete.update msg delete)
        success = (succeeded msg TypesDelete.Deleted "Type deleted")
      in
        refreshList success ({ model | delete = newDelete } , Cmd.map Deleting msgs)

    MenuClick (job, name) -> 
      case job of
        "clear" -> 
           none { model | delete = setName delete name }
           
        "edit" -> 
          let
            (newEdit, msgs) = TypesEdit.update (TypesEdit.LoadType name) edit
          in 
            ({ model | edit = newEdit }, Cmd.map Editing msgs)
         
        _ -> 
          none model

update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  navigate msg (route msg model)

view : Model -> Route -> Html Msg
view ({list, add, view, delete, edit} as model) section =
   case section of
     Routing.List -> 
       App.map Listing (TypesList.view list)

     Routing.Add -> 
       App.map Adding (TypesAdd.view add)

     Routing.Edit _ -> 
       App.map Editing (TypesEdit.view edit)

     Routing.View _ -> 
       App.map Viewing (TypesView.view view)

     Routing.Delete _ -> 
       App.map Deleting (TypesDelete.view delete)
