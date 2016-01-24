module Systems.Add.GCE where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
import Systems.View.GCE exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(OSTemplates))
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
    steps = [ Instance, Networking, Summary ]
  in 
  (Model Zero [] steps (emptyGce) (emptyMachine) Dict.empty Dict.empty, Effects.none)

type Action = 
  Next 
  | Back 
  | Update Environment
  | SelectMachineType String
  | SelectOS String
  | SelectZone String
  | UserInput String
  | ProjectIdInput String
  | TagsInput String
  | HostnameInput String
  | DomainInput String
  | IPInput String

type Step = 
  Zero
  | Instance
  | Networking
  | Summary

-- Update

setGCE : (GCE -> GCE) -> Model -> Model
setGCE f ({gce, errors} as model) =
  let
    newGce = f gce
  in
   { model | gce = newGce }

stringValidations = Dict.fromList [
    vpair Networking [
        ("Hostname", validationOf "Hostname" [notEmpty] (\({machine} as model) -> machine.hostname))
      , ("Domain", validationOf "Domain" [notEmpty] (\({machine} as model) -> machine.domain))
      , ("IP", validationOf "IP" [validIp] (\{gce} -> withDefault "" gce.staticIp))
    ],
    vpair Instance [
        ("User", validationOf "User" [notEmpty] (\({machine} as model) -> machine.user)),
        ("Project id", validationOf "Project id" [notEmpty] (\({gce} as model) -> gce.projectId))
    ]
 ]

listValidations = Dict.fromList [
    vpair Instance [
      ("Tags", validationOf "Tags" [hasItems] (\({gce} as model) -> (defaultEmpty gce.tags)))
    ]
 ]

validateGce = validateAll [listValidations, stringValidations]

update : Action -> Model-> Model
update action ({next, prev, step, gce, machine} as model) =
  case action of
    Next -> 
      let
        nextStep = withDefault Instance (List.head next)
        nextSteps = defaultEmpty (List.tail next)
        prevSteps = if step /= Zero then List.append prev [step] else prev
        ({errors} as newModel) = (validateGce step model)
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
        ({errors} as newModel) = (validateGce step model)
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

    SelectMachineType type' -> 
      setGCE (\gce -> {gce | machineType = type' }) model

    SelectOS newOS -> 
      setMachine (\machine -> {machine | os = newOS }) model

    SelectZone zone -> 
      setGCE (\gce -> {gce | zone = zone }) model 

    UserInput user -> 
       model 
        |> setMachine (\machine -> {machine | user = user })
        |> validate step "User" stringValidations

    HostnameInput host -> 
      model 
        |> setMachine (\machine -> {machine | hostname = host })
        |> validate step "Hostname" stringValidations
         
    ProjectIdInput id -> 
      model 
        |> setGCE (\gce-> {gce | projectId = id })
        |> validate step "Project id" stringValidations

    TagsInput tags -> 
      let
        splited = String.split " " tags
      in
        model  
          |>  setGCE (\gce -> {gce | tags = Just (if splited == [""] then [] else splited)})
          |>  validate step "Tags" listValidations

    DomainInput domain -> 
      model 
        |> setMachine (\machine -> {machine | domain = domain})
        |> validate step "Domain" stringValidations

    IPInput ip -> 
      model 
        |> setGCE (\gce -> {gce | staticIp = Just ip})
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
    hypervisor = withDefault (OSTemplates Dict.empty) (Dict.get "gce" model.environment)
  in 
    case hypervisor of
      OSTemplates oses -> 
        oses
      _ -> 
        Dict.empty

networking: Signal.Address Action -> Model -> List Html
networking address ({errors, gce, machine} as model) =
  let 
    check = withErrors errors
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
     [
       legend [] [text "DNS"]
     , check "Hostname" (inputText address HostnameInput "" machine.hostname)
     , check "Domain"  (inputText address DomainInput "" machine.domain)
     , check "IP" (inputText address IPInput "" (withDefault "" gce.staticIp))
     ]
  ]


instance : Signal.Address Action -> Model -> List Html
instance address ({gce, machine, errors} as model) =
  let
    check = withErrors errors
    tags = (String.join " " (defaultEmpty gce.tags))
    zone = withDefault "" (List.head zones)
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ 
         legend [] [text "Properties"]
       , group' "Machine type" (selector address SelectMachineType machineTypes gce.machineType)
       , group' "OS" (selector address SelectOS (Dict.keys (getOses model)) machine.os)
       , group' "Zone" (selector address SelectZone zones gce.zone)
       , check "Project id" (inputText address ProjectIdInput "" gce.projectId)
       , legend [] [text "Security"]
       , check "User" (inputText address UserInput "" model.machine.user) 
       , check "Tags" (inputText address TagsInput " " tags)]
   ]

withErrors : Dict String (List Error) -> String ->  Html -> Html
withErrors errors key widget =
  group key widget (defaultEmpty  (Dict.get key errors))


stepView :  Signal.Address Action -> Model -> List Html
stepView address ({gce, machine} as model) =
  case model.step of
    Instance -> 
      instance address model 

    Networking -> 
      networking address model

    Summary -> 
      summarize (gce, machine)

    _ -> 
      Debug.log (toString model.step) [div [] []]


view : Signal.Address Action -> Model -> List Html
view address ({step} as model)=
  panelContents (toString step) (Html.form [] (stepView address model))
