module Users.Core where

import Effects exposing (Effects)
import Html exposing (..)
import Nav.Common exposing (Section(Add, List, View, Edit, Delete), Active(Users))
import Users.List as List exposing (Action)
import Users.Add as Add exposing (Action)
import Common.Utils exposing (none)



type alias Model = 
  {
   list : List.Model 
  , add : Add.Model 
  , navChange : Maybe (Active, Section)
  }
 
init : (Model , Effects Action)
init =
  let 
    (list, listActions) = List.init
    (add, addActions) = Add.init
    effects = [
        Effects.map Listing listActions
     ,  Effects.map Adding addActions
     ]
  in 
    (Model list add Nothing, Effects.batch effects)

-- Update 

type Action = 
  Listing List.Action
    | Adding Add.Action
    | MenuClick (String, String)
    | NoOp


navigate : Action -> (Model , Effects Action) -> (Model , Effects Action)
navigate action ((({list} as model), effects) as result) =
  case action of 
    MenuClick (job,_) -> 
      case job of 
        "edit" -> 
          ({ model | navChange = Just (Users, Edit) }, effects)
           
        "clear" -> 
          ({ model | navChange = Just (Users, Delete) }, effects)

        _ -> 
            none model

    _ -> 
     none model

route : Action ->  Model -> (Model , Effects Action)
route action ({list, add} as model) =
  case action of 
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

update : Action ->  Model-> (Model , Effects Action)
update action model =
  navigate action (route action model)


-- View

view : Signal.Address Action -> Model -> Section -> List Html
view address ({list, add} as model) section =
  case section of 
     List -> 
       List.view (Signal.forwardTo address Listing) list

     Add -> 
       Add.view (Signal.forwardTo address Adding) add

     _ -> 
       [div [] [text "not implemented"]]
