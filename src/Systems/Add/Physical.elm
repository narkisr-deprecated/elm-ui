module Systems.Add.Physical where

import Bootstrap.Html exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
import Systems.View.Physical exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(OSTemplates))
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.Physical exposing (..)
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
  , physical : Physical
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  }

init : (Model , Effects Action)
init =
  let 
    steps = [ Instance, Summary ]
  in 
  (Model Zero [] steps (emptyPhysical) (emptyMachine) Dict.empty Dict.empty, Effects.none)

type Action = 
  Next 
  | Back 
  | Update Environment
  | SelectOS String
  | UserInput String
  | HostnameInput String
  | DomainInput String
  | MacInput String
  | BroadcastInput String
  | IPInput String

type Step = 
  Zero
  | Instance
  | Summary

-- Update

setPhysical : (Physical -> Physical) -> Model -> Model
setPhysical f ({physical, errors} as model) =
  let
    newPhysical = f physical
  in
   { model | physical = newPhysical}

stringValidations = Dict.fromList [
    vpair Instance [
        ("Hostname", validationOf "Hostname" [notEmpty] (\({machine} as model) -> machine.hostname))
      , ("Domain", validationOf "Domain" [notEmpty] (\({machine} as model) -> machine.domain))
      , ("User", validationOf "User" [notEmpty] (\({machine} as model) -> machine.user))
      , ("IP", validationOf "IP" [validIp, notEmpty] (\({machine} as model) -> withDefault "" machine.ip))
    ]
 ]

validatePhysical = validateAll [stringValidations]

update : Action -> Model-> Model
update action ({next, prev, step, physical, machine} as model) =
  case action of
    Next -> 
      let
        nextStep = withDefault Instance (List.head next)
        nextSteps = defaultEmpty (List.tail next)
        prevSteps = if step /= Zero then List.append prev [step] else prev
        ({errors} as newModel) = (validatePhysical step model)
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
        ({errors} as newModel) = (validatePhysical step model)
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
               if (String.isEmpty machine.os) then
                 { newModel | machine = {machine | os = os }}
               else 
                 newModel
             Nothing -> 
               newModel

    SelectOS newOS -> 
      setMachine (\machine -> {machine | os = newOS }) model

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

    MacInput mac -> 
      setPhysical (\physical -> {physical| mac = Just mac}) model 

    BroadcastInput ip -> 
      setPhysical (\physical -> {physical| broadcast = Just ip}) model 

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
    hypervisor = withDefault (OSTemplates Dict.empty) (Dict.get "physical" model.environment)
  in 
    case hypervisor of
      OSTemplates oses -> 
        oses
      _ -> 
        Dict.empty

instance : Signal.Address Action -> Model -> List Html
instance address ({physical, machine, errors} as model) =
  let
    check = withErrors errors
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ 
         legend [] [text "Security"]
       , check "User" (inputText address UserInput "" machine.user) 
       , legend [] [text "Networking"]
       , check "IP"  (inputText address IPInput "" (withDefault "" machine.ip))
       , check "Hostname" (inputText address HostnameInput "" machine.hostname)
       , check "Domain"  (inputText address DomainInput "" machine.domain)
       , legend [] [text "WOL"]
       , check "Mac"  (inputText address MacInput "" (withDefault "" physical.mac))
       , check "Broadcast"  (inputText address BroadcastInput "" (withDefault "" physical.broadcast))
       ]
    ]

withErrors : Dict String (List Error) -> String ->  Html -> Html
withErrors errors key widget =
  group key widget (defaultEmpty  (Dict.get key errors))


stepView :  Signal.Address Action -> Model -> List Html
stepView address ({physical, machine} as model) =
  case model.step of
    Instance -> 
      instance address model 

    Summary -> 
      summarize (physical, machine)

    _ -> 
      Debug.log (toString model.step) [div [] []]


view : Signal.Address Action -> Model -> List Html
view address ({step} as model)=
  panelContents (toString step) (Html.form [] (stepView address model))
