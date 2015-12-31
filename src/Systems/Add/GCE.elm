module Systems.Add.GCE where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
-- import Systems.View.AWS exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor)
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.GCE exposing (..)
import Effects exposing (Effects, batch)
import Common.Components exposing (panelContents)
import Common.Utils exposing (withDefaultProp, defaultEmpty)
import String
import Maybe exposing (withDefault)
import Debug

-- Model 

type alias Model = 
  { step : Step
  , prev : List Step
  , next : List Step
  , gce : GCE
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  }

init : (Model , Effects Action)
init =
  let 
    steps = [ Instance, Summary ]
  in 
  (Model Zero [] steps (emptyGce) (emptyMachine) Dict.empty Dict.empty, Effects.none)

type Action = 
  Next 
  | Back 
  | Update Environment
  | SelectMachieType String
  | SelectOS String
  | SelectZone String
  | SecurityGroupsInput String
  | UserInput String
  | HostnameInput String
  | DomainInput String

type Step = 
  Zero
  | Instance
  | Summary

-- Update

setGCE : (GCE -> GCE) -> Model -> Model
setGCE f ({gce, errors} as model) =
  let
    newGce = f aws
  in
   { model | aws = newGce }

setMachine: (Machine-> Machine) -> Model -> Model
setMachine f ({machine} as model) =
  let
    newMachine = f machine
  in
   { model | machine = newMachine }

setVolume : (Volume -> Volume) -> Model -> Model
setVolume f ({volume} as model) =
  let
    newVolume = f volume
  in
    { model | volume = newVolume }  

setBlock : (Block -> Block)-> Model -> Model
setBlock f ({block} as model) =
  let
    newBlock = f block
  in
    { model | block = newBlock }  



validationOf : String -> List (a -> Error) -> (Model -> a) -> Model -> Model
validationOf key validations value ({errors} as model) =
   let
     res = List.filter (\error -> error /= None) (List.map (\validation -> (validation (value model))) validations)
     newErrors = Dict.update key (\_ -> Just res) errors
   in
     {model | errors = newErrors}

extractIp : Model -> String
extractIp ({machine} as model) =
  case machine.ip of
    Just ip ->
      ip
    Nothing -> 
      ""
  
stringValidations = Dict.fromList [
    vpair Networking [
        ("Hostname", validationOf "Hostname" [notEmpty] (\({machine} as model) -> machine.hostname))
      , ("Domain", validationOf "Domain" [notEmpty] (\({machine} as model) -> machine.domain))
      , ("IP", validationOf "IP" [validIp] extractIp)
    ]
  , vpair Instance [
        ("User", validationOf "User" [notEmpty] (\({machine} as model) -> machine.user))
      , ("Keypair", validationOf "Keypair" [notEmpty] (\({aws} as model) -> aws.keyName))
    ]
 ]

  
listValidations = Dict.fromList [
    vpair Instance [
      ("Security groups", validationOf "Security groups" [hasItems] (\({aws} as model) -> (defaultEmpty aws.securityGroups)))
    ]
 ]


validate : Step -> String -> Dict String (Dict String (Model -> Model)) -> (Model -> Model)
validate step key validations =
  let
    stepValidations =  withDefault Dict.empty (Dict.get (toString step) validations)
  in
    withDefault identity (Dict.get key stepValidations)


validateAll : Step -> Model -> Model
validateAll step model =
  let
    validations = [listValidations, stringValidations]
    stepValues = (List.map (\vs -> withDefault Dict.empty (Dict.get (toString step) vs)) validations)
  in
    List.foldl (\v m -> (v m)) model (List.concat (List.map Dict.values stepValues))

notAny:  Dict String (List Error) -> Bool
notAny errors =
  List.isEmpty (List.filter (\e -> not (List.isEmpty e)) (Dict.values errors))

update : Action -> Model-> Model
update action ({next, prev, step, aws, machine, volume, block} as model) =
  case action of
    Next -> 
      let
        nextStep = withDefault Instance (List.head next)
        nextSteps = defaultEmpty (List.tail next)
        prevSteps = if step /= Zero then List.append prev [step] else prev
        ({errors} as newModel) = (validateAll step model)
      in
        if notAny errors then
          {newModel | step = nextStep, next = nextSteps, prev = prevSteps}
        else 
          newModel

    Back -> 
      let
        prevStep = withDefault Zero (List.head (List.reverse prev))
        prevSteps = List.take ((List.length prev) - 1) prev
        nextSteps = if step /= Zero then List.append [step] next else next
        ({errors} as newModel) = (validateAll step model)
      in
        if notAny errors then
          {model | step = prevStep, next = nextSteps, prev = prevSteps}
        else 
          model

    Update environment -> 
        let
           newModel = { model | environment = environment }
        in 
          case List.head (Dict.keys (getOses newModel)) of
             Just os -> 
               { newModel | machine = {machine | os = os }}
             Nothing -> 
               newModel

    SelectMachineType type' -> 
      setGCE (\gce -> {gce | instanceType = type' }) model

    SelectOS os -> 
      setMachine (\machine -> {machine | os = os }) model

    SelectZone zone -> 
      setGCE (\gce -> {gce | availabilityZone = (Just zone) }) model 

    UserInput user -> 
       model 
        |> setMachine (\machine -> {machine | user = user })
        |> validate step "User" stringValidations

    HostnameInput host -> 
      model 
        |> setMachine (\machine -> {machine | hostname = host })
        |> validate step "Hostname" stringValidations

    DomainInput domain -> 
      model 
        |> setMachine (\machine -> {machine | domain = domain})
        |> validate step "Domain" stringValidations

    IPInput ip -> 
      model 
        |> setMachine (\machine -> {machine | ip = Just ip })
        |> validate step "IP" stringValidations

hasNext : Model -> Bool
hasNext model =
  not (List.isEmpty model.next)

hasPrev : Model -> Bool
hasPrev model =
  not (List.isEmpty model.prev)

getOses : Model -> Dict String Template
getOses model =
  let 
    hypervisor = withDefault (ENV.GCE Dict.empty) (Dict.get "gce" model.environment)
  in 
    case hypervisor of
      ENV.GCE oses -> 
        oses
      _ -> 
        Dict.empty


instance : Signal.Address Action -> Model -> List Html
instance address ({gce, machine, errors} as model) =
  let
    check = withErrors errors
    groups = (String.join " " (defaultEmpty gce.securityGroups))
    points = (List.map (\(name,_,_) -> name) (Dict.values endpoints))
    zone = withDefault "" (List.head (Dict.keys (Dict.filter (\k (name,url,zones) -> url == gce.endpoint) endpoints)))
    (name,_,zones) = withDefault ("","",[]) (Dict.get zone endpoints)
    zoneOptions = (List.append [""] (List.map (\k -> zone ++ k) zones))
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ 
         legend [] [text "Properties"]
       , group' "Machine type" (selector address SelectMachineType instanceTypes gce.instanceType)
       , group' "OS" (selector address SelectOS (Dict.keys (getOses model)) machine.os)
       , group' "Endpoint" (selector address SelectEndpoint points name)
       , group' "Availability Zone" (selector address SelectZone zoneOptions (withDefault "" gce.availabilityZone))
       , legend [] [text "Security"]
       , check "User" (inputText address UserInput "" model.machine.user) 
       , check "Keypair" (inputText address KeyPairInput "" gce.keyName)
       , check "Security groups" (inputText address SecurityGroupsInput " " groups)]
   ]

withErrors : Dict String (List Error) -> String ->  Html -> Html
withErrors errors key widget =
  group key widget (defaultEmpty  (Dict.get key errors))


stepView :  Signal.Address Action -> Model -> List Html
stepView address ({gce, machine} as model) =
  case model.step of
    Instance -> 
      instance address model 

    Summary -> 
      Debug.log (toString model.step) [div [] []]
      -- summarize (gce, machine)

    _ -> 
      Debug.log (toString model.step) [div [] []]


view : Signal.Address Action -> Model -> List Html
view address ({step} as model)=
  panelContents (toString step) (Html.form [] (stepView address model))
