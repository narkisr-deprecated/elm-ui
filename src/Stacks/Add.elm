module Stacks.Add exposing (..)


import Html exposing (..)
import Common.Components exposing (panel, panelContents, infoCallout, info, onSelect, group', inputText, checkbox, selector)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Common.Utils exposing (none)
import Common.Errors exposing (successHandler)
import Stacks.Model exposing (Stack, emptyStack)
import Http exposing (Error(BadResponse))
import Debug

-- Templates
import Templates.Model.Common exposing (Template)
import Templates.List exposing (getTemplates)

type alias Model = 
  {
    stack : Stack
  , template : String
  , templates : List String
  , editDefaults : Bool
  }
 
init : (Model , Effects Msg)
init =
  (Model emptyStack "" [] False, getTemplates SetTemplates)

-- Update 

type Msg = 
  LoadTemplates
   | NameInput String
   | SelectTemplate String
   | LoadEditor
   | DescriptionInput String
   | Select (List String)
   | SetTemplates (Result Http.Error (List Template))
   | Save
   | Cancel
   | NoOp

setTemplates: Model -> List Template -> (Model , Effects Msg)
setTemplates model newTemplates = 
  none { model | templates = (List.map (\{name} -> name) newTemplates)}


update : Msg ->  Model -> (Model , Cmd Msg)
update msg model =
  case msg of 
   LoadTemplates -> 
     (model, getTemplates SetTemplates)

   Select templates -> 
     none model  

   SetTemplates result ->
     successHandler result model (setTemplates model) NoOp
   
   _ -> 
     none model

-- View

addView address ({template, templates, stack, editDefaults} as model) =
    panel
      (panelContents 
          (Html.form [] [
            div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
              group' "Name" (inputText address NameInput " "  stack.name)
            , group' "Description" (inputText address DescriptionInput " "  stack.description)
            , group' "Templates" (selector address SelectTemplate templates template)
            , group' "Edit common" (checkbox address LoadEditor editDefaults)
            , div [ id "jsoneditor"
                  , style [("width", "550px"), ("height", "400px"), ("margin-left", "25%")]] []
           ]
          ])
        )


view : Model -> Html Msg
view model =
  div [] 
    (infoCallout address (info "Add a new Stack" ) (addView address model) Cancel Save)
