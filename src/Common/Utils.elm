module Common.Utils where

partition n list =
  let
    catch = (List.take n list)
  in 
    if n == (List.length catch) then
      [catch] ++ (partition n (List.drop n list))
    else
      [catch]


