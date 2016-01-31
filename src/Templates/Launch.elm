module Templates.Launch where

import Effects exposing (Effects)
import Html exposing (..)
import Templates.Model.Common exposing (emptyTemplate, Template)
import Common.Utils exposing (none)
import Debug


type alias Model = 
  {
    job : String 
  , name : String
  , template : Template
  }
 
init : (Model , Effects Action)
init =
  none (Model "" "" emptyTemplate)

-- Update 

type Action = 
  SetupJob (String, String)
    | SetTemplate Template
    | NoOp

update : Action ->  Model-> (Model , Effects Action)
update action model =
  case action of 
    SetupJob (job, name) ->
       none { model | job = job, name = name }
    
    SetTemplate template -> 
      none { model | template = template } 

    NoOp -> 
      none model

-- View

view : Signal.Address Action -> Model -> List Html
view address ({template} as model) =
  [
    div [] [
       text template.name
    ]
  ]


