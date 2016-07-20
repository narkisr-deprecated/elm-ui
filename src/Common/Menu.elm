port module Common.Menu exposing (..)

-- Systems
import Systems.List
import Systems.Launch as SystemsLaunch
import Systems.Core as SystemsCore

-- Types
import Types.Core as TypesCore
import Types.Add as TypesAdd
import Types.Edit as TypesEdit

-- Templates
import Templates.Add as TemplatesAdd
import Templates.Core as TemplatesCore

-- Users
import Users.Core as UsersCore

import Application as App

intoMsg msg  =
    case msg of
      App.MenuMsg (dest, job, target) ->
        case dest  of
          "Systems" ->
            App.SystemsMsg (SystemsCore.SystemsLaunch (SystemsLaunch.SetupJob job))
          "Templates" ->
            App.TemplatesMsg (TemplatesCore.SetupJob (job, target))

          "Types" ->
            App.TypesMsg (TypesCore.MenuClick (job, target))

          "Users" ->
            App.UsersMsg (UsersCore.MenuClick (job, target))

          _ ->
            App.NoOp

      _ ->
          msg


port menuPort : ((String, String,String) -> msg) -> Sub msg

