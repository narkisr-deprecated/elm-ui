module Common.EditSub exposing (editorValue)

import Common.Editor exposing (Msg(Load))
-- Templates
import Templates.Add as TemplatesAdd
import Templates.Core as TemplatesCore

-- Types
import Types.Core as TypesCore
import Types.Add as TypesAdd
import Types.Edit as TypesEdit

import Application as App

editorValue p =
    case p of 
      App.EditMsg (Load (target, json)) -> 
        case target of
          "templates" ->
            App.TemplatesMsg (TemplatesCore.TemplatesAdd (TemplatesAdd.SetDefaults json))

          "typesAdd" ->
            App.TypesMsg (TypesCore.Adding (TypesAdd.SetClasses json))

          "typesEdit" ->
            App.TypesMsg (TypesCore.Editing (TypesEdit.AddMsg (TypesAdd.SetClasses json)))

          _ ->
            App.NoOp

      _ -> 
        App.NoOp


