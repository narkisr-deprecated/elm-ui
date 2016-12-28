port module Common.Menu exposing (..)

-- Systems

import Systems.List
import Systems.Launch as SystemsLaunch
import Systems.Core as SystemsCore


-- Users

import Users.Core as UsersCore
import Application as App


intoMsg msg =
    case msg of
        App.MenuMsg ( dest, job, target ) ->
            case dest of
                "Systems" ->
                    App.SystemsMsg (SystemsCore.SystemsLaunch (SystemsLaunch.SetupJob job))

                "Templates" ->
                    App.TemplatesMsg (TemplatesCore.SetupJob ( job, target ))

                "Users" ->
                    App.UsersMsg (UsersCore.MenuClick ( job, target ))

                _ ->
                    App.NoOp

        _ ->
            msg


port menuPort : (( String, String, String ) -> msg) -> Sub msg
