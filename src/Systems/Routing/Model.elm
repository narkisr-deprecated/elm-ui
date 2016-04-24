module Systems.Routing.Model where

type Route = 
  Add
    | List
    | View Int
    | Delete Int

