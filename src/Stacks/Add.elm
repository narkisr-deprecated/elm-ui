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
 
init : (Model , Cmd Msg)
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

setTemplates: Model -> List Template -> (Model , Cmd Msg)
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

addView ({template, templates, stack, editDefaults} as model) =
    panel
      (panelContents 
          (Html.form [] [
            div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] [
              group' "Name" (inputText NameInput " "  stack.name)
            , group' "Description" (inputText DescriptionInput " "  stack.description)
            , group' "Templates" (selector SelectTemplate templates template)
            , group' "Edit common" (checkbox LoadEditor editDefaults)
            , div [ id "jsoneditor"
                  , style [("width", "550px"), ("height", "400px"), ("margin-left", "25%")]] []
           ]
          ])
        )


view : Model -> Html Msg
view model =
    (infoCallout (info "Add a new Stack" ) (addView model) Cancel Save)
