module Nav.Common exposing (..)


import Html exposing (..)

type Active =
  Systems
    | Types
    | Jobs
    | Templates
    | Stacks
    | Users

type Section =
  Add
    | Launch
    | Delete
    | Edit
    | List
    | View
    | Stats


