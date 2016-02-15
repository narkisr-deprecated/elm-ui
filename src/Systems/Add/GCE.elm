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
import Common.Components exposing (fixedPanel, asList)
import Common.Utils exposing (withDefaultProp, defaultEmpty)
import String
import Maybe exposing (withDefault)
import Debug
import Common.Wizard as Wizard
import Common.Components exposing (..)

-- Model 

type alias Model = 
  { 
    wizard : (Wizard.Model Step)
  , gce : GCE
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  }

init : (Model , Effects Action)
init =
  let 
    wizard = Wizard.init Zero Instance [ Instance, Networking, Summary ]
  in 
   (Model wizard emptyGce emptyMachine Dict.empty Dict.empty, Effects.none)

type Action = 
  WizardAction Wizard.Action
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
update action ({wizard, gce, machine} as model) =
  case action of
    WizardAction action -> 
      let
        ({errors} as newModel) = (validateGce wizard.step model)
        newWizard = Wizard.update (notAny errors) action wizard
      in
       { newModel | wizard = newWizard } 

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
        |> validate wizard.step "User" stringValidations

    HostnameInput host -> 
      model 
        |> setMachine (\machine -> {machine | hostname = host })
        |> validate wizard.step "Hostname" stringValidations
         
    ProjectIdInput id -> 
      model 
        |> setGCE (\gce-> {gce | projectId = id })
        |> validate wizard.step "Project id" stringValidations

    TagsInput tags -> 
      let
        splited = String.split " " tags
      in
        model  
          |>  setGCE (\gce -> {gce | tags = Just (if splited == [""] then [] else splited)})
          |>  validate wizard.step "Tags" listValidations

    DomainInput domain -> 
      model 
        |> setMachine (\machine -> {machine | domain = domain})
        |> validate wizard.step "Domain" stringValidations

    IPInput ip -> 
      model 
        |> setGCE (\gce -> {gce | staticIp = Just ip})
        |> validate wizard.step "IP" stringValidations

next : Model -> Environment -> Model
next model environment =
      model 
         |> update (Update environment) 
         |> update (WizardAction Wizard.Next)

back model =
  (update (WizardAction Wizard.Back) model)


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

stepView :  Signal.Address Action -> Model -> List Html
stepView address ({wizard, gce, machine} as model) =
  case wizard.step of
    Instance -> 
      instance address model 

    Networking -> 
      networking address model

    Summary -> 
      summarize (gce, machine)

    _ -> 
      Debug.log (toString wizard.step) [div [] []]


view : Signal.Address Action -> Model -> List Html
view address model =
  asList (fixedPanel (Html.form [] (stepView address model)))
