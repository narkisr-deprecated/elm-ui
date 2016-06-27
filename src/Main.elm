port module Main exposing (..)

import Html.App as Html -- was StartA
import Task
import Application as App exposing (init, view, update ,Msg(EditMsg), Model, urlUpdate) 
import Users.Core as UsersCore
import Json.Encode as E exposing (list, string)

-- Systems
import Systems.List
import Systems.Launch as SystemsLaunch
import Systems.Core as SystemsCore

-- Types
import Types.Core as TypesCore
import Types.Add as TypesAdd
import Types.Edit as TypesEdit

-- Routing
import Hop
import Hop.Types exposing (Router)
import Routing exposing (..)
import Task exposing (Task)

-- Templates
import Templates.Add as TemplatesAdd
import Templates.Core as TemplatesCore

-- Stacks
import Stacks.Add as StacksAdd
import Stacks.Core as StacksCore

-- Jobs 
import Time exposing (every, second)
import Jobs.Core as Jobs

-- Common 
import Common.Editor exposing (editorOutPort, editorInPort, Msg(Load))

-- Navigation
import Navigation

-- main =  
--   Html.program
--     { init = init
--     , update = update
--     , view = view
--     , subscriptions = subscriptions
--     }

main : Program Never
main =
    Navigation.program urlParser
        { init = init
        , view = view
        , update = update
        , urlUpdate = urlUpdate
        , subscriptions = subscriptions
        }

subscriptions : Model -> Sub App.Msg
subscriptions model =
    editorInPort (EditMsg << Load)


port parser : String -> Cmd msg

