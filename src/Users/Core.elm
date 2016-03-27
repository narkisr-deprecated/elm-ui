module Users.Core where

import Effects exposing (Effects)
import Html exposing (..)
import Nav.Common exposing (Section(Add, List, View, Edit, Delete), Active(Users))
import Users.List as List exposing (Action)
import Common.Utils exposing (none)



type alias Model = 
  {
   list : List.Model 
  , navChange : Maybe (Active, Section)
  }
 
init : (Model , Effects Action)
init =
  let 
    (list, listActions) = List.init
  in 
    (Model list Nothing, Effects.map Listing listActions)

-- Update 

type Action = 
  Listing List.Action
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
route action ({list} as model) =
  case action of 
    Listing listing -> 
      let
        (newList, effects) =  List.update listing list 
      in
        ({model | list = newList }, Effects.map Listing effects)

    _ -> 
      none model

update : Action ->  Model-> (Model , Effects Action)
update action model =
  navigate action (route action model)


-- View

view : Signal.Address Action -> Model -> Section -> List Html
view address ({list} as model) section =
  case section of 
     List -> 
       List.view (Signal.forwardTo address Listing) list

     _ -> 
       [div [] [text "not implemented"]]
