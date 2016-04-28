module Systems.Routing.Model where

type Route = 
  Add
    | Launch
    | List
    | View Int
    | Delete Int

