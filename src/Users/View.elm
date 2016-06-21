module Users.View exposing (..)


import Html exposing (..)
import Users.Model as Model exposing (User, emptyUser)
import Common.Model exposing (valueOf)
import Common.Utils exposing (partition, withDefaultProp)
import Bootstrap.Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Common.Summary exposing (..)
import Common.Components exposing (asList)
import Maybe exposing (withDefault)
import Http exposing (Error(BadResponse))
import Common.Utils exposing (none, capitalize)
import Common.Errors exposing (successHandler)
import Common.Http exposing (getJson)
import Task
import Dict exposing (Dict)
import String


type alias Model = 
  {
   user : User
  }
 
init : (Model , Effects Msg)
init =
  none (Model emptyUser)

-- Update 

type Msg = 
  ViewUser String
    | SetUser (Result Http.Error User)
    | NoOp

setUser: Model -> User -> (Model , Effects Msg)
setUser model user =
  none {model | user = user}


update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  case msg of 
   ViewUser id -> 
     (model, getUser id SetUser)

   SetUser result -> 
      successHandler result model (setUser model) NoOp
 
   NoOp -> 
     (model, Effects.none)

-- View

summarize: User -> Html
summarize model =
   div [style [("line-height", "1.8"), ("list-style-type","none")]] []

view : Signal.Address Msg -> Model -> List Html
view address {user} =
  asList (div [] [h4 [] [(text "User")], (summarize user)])
  
getUser name msg = 
  getJson Model.user ("/users/" ++ name)
    |> Task.toResult
    |> Task.map msg
    |> Effects.task

