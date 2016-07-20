module Common.Utils exposing (..)

import Platform.Cmd exposing (batch, map)
import Dict exposing (Dict)
import Maybe exposing (withDefault)
import Dict exposing (Dict)
import String
import Char

partition n list =
  let
    catch = (List.take n list)
  in
    if n == (List.length catch) then
      [catch] ++ (partition n (List.drop n list))
    else
      [catch]

withDefaultProp :  Maybe a -> b -> (a -> b) -> b
withDefaultProp parent default prop =
 case parent of
   Just v ->
     (prop v)

   Nothing ->
     default


defaultEmpty : Maybe (List a) -> List a
defaultEmpty list =
  case list of
    Just result  ->
      result

    Nothing ->
      []

none : a -> (a, Cmd b)
none a =
  (a, Cmd.none)

setEnvironments model es =
   none {model | environments = Dict.keys es}

setEnvironment ({environments} as model) es =
   none {model |  environment = (Maybe.withDefault "" (List.head (Dict.keys es)))}

capitalize : String -> String
capitalize s =
  case String.uncons s of
    Just (c,ss) ->
      String.cons (Char.toUpper c) ss

    Nothing ->
      s
