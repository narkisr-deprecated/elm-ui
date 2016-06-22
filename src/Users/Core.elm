module Users.Core exposing (..)


import Html exposing (..)
import Users.List as List exposing (Msg)
import Users.Add as Add exposing (Msg)
import Common.Utils exposing (none)
import Common.Components exposing (notImplemented, asList)

-- Routing
import Users.Routing as Routing exposing (Route)

type alias Model = 
  {
   list : List.Model 
  , add : Add.Model 
  , navChange : Maybe String
  }
 
init : (Model , Cmd Msg)
init =
  let 
    (list, listMsgs) = List.init
    (add, addMsgs) = Add.init
    effects = [
        Effects.map Listing listMsgs
     ,  Effects.map Adding addMsgs
     ]
  in 
    (Model list add Nothing, Effects.batch effects)

-- Update 

type Msg = 
  Listing List.Msg
    | Adding Add.Msg
    | MenuClick (String, String)
    | NoOp


navigate : Msg -> (Model , Effects Msg) -> (Model , Effects Msg)
navigate msg ((({list} as model), effects) as result) =
  case msg of 
    MenuClick (job,name) -> 
      case job of 
        "edit" -> 
          ({ model | navChange = Just ("/users/edit/" ++ name) }, effects)
           
        "clear" -> 
          ({ model | navChange = Just ("/users/delete/" ++ name) }, effects)

        _ -> 
            none model

    _ -> 
     none model

route : Msg ->  Model -> (Model , Effects Msg)
route msg ({list, add} as model) =
  case msg of 
    Listing listing -> 
      let
        (newList, effects) =  List.update listing list 
      in
        ({model | list = newList }, Effects.map Listing effects)

    Adding adding -> 
      let
        (newAdd, effects) =  Add.update adding add
      in
        ({model | add = newAdd }, Effects.map Adding effects)


    _ -> 
      none model

update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  navigate msg (route msg model)


-- View

view : Model -> Route -> List (Html Msg)
view ({list, add} as model) section =
   case section of
     Routing.List -> 
        List.view (Signal.forwardTo Listing) list

     Routing.Add -> 
        Add.view (Signal.forwardTo Adding) add
      
     _ -> 
       asList notImplemented

