module Nav.Common where

import Effects exposing (Effects)
import Html exposing (..)

type Active = 
  Systems 
    | Types 
    | Jobs
    | Templates
    | Stacks

type Section = 
  Add 
    | Launch 
    | Delete
    | Edit
    | List 
    | View
    | Stats


