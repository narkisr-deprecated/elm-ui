module Types.Persistency where

import Types.Model exposing (Type) 
import Effects exposing (Effects)
import Json.Encode as E exposing (..)
import Maybe exposing (withDefault)
import Dict exposing (Dict)


moduleEncoder module'  = 
  object [
  ]

option = 
  object []

puppetEncoder {module', args} = 
  object [
    ("module", moduleEncoder module')
  , ("args", list (List.map string args))
  ]

dictEncoder enc dict = 
   Dict.toList dict 
     |> List.map (\(k,v) -> (k, enc v)) 
     |> object 


encode: Type -> Value
encode ({type', description, puppetStd}) =
 object [
    ("type" , string type')
  , ("description" , string (withDefault "" description))
  , ("puppet-std", dictEncoder puppetEncoder puppetStd)
 ] 


persistModel : (String -> Effects a) -> Value -> Effects a
persistModel f value =
    (f (E.encode 0 value))

persistType f type' = 
  persistModel f (encode type')

