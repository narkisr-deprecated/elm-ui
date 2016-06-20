module Types.Persistency exposing (..)

import Common.Model exposing (..)
import Types.Model exposing (Type) 
import Effects exposing (Effects)
import Json.Encode as E exposing (..)
import Maybe exposing (withDefault)
import Dict exposing (Dict)


moduleEncoder {name, src, options}  = 
  object [
    ("name", string name)
  , ("src", string src)
  ]

option o = 
  case o of
    BoolOption value -> 
       bool value

    StringOption value -> 
       string value

    IntOption value -> 
       int value

    DictOption dict -> 
       dictEncoder option dict

encodeClasses classes = 
  (E.encode 0 (dictEncoder option classes))

puppetEncoder {module', args, classes} = 
  object [
    ("module", moduleEncoder module')
  , ("args", list (List.map string args))
  , ("classes", dictEncoder option classes)
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

