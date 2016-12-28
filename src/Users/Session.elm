module Users.Session exposing (..)

import Json.Decode as Json exposing (..)
import Http
import Common.Http exposing (getJson)
import Task


type alias Session =
    { envs : List String
    , identity : String
    , operations : List String
    , roles : List String
    , username : String
    }


emptySession : Session
emptySession =
    (Session [] "" [] [] "")


session : Decoder Session
session =
    map5 Session
        (field "envs" (list string))
        (field "identity" string)
        (field "operations" (list string))
        (field "roles" (list string))
        (field "username" string)


getSession msg =
    getJson session "/sessions" msg


logout msg =
    Http.send msg <| Http.getString "/logout"


isUser : Session -> Bool
isUser { roles } =
    List.member "celestial.roles/user" roles
