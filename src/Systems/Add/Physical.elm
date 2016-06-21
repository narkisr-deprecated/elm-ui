module Systems.Add.Physical exposing (..)

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
import Platform.Cmd exposing (batch)
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
  , physical : Physical
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  }

init : Model
init =
  let 
    wizard = Wizard.init Zero Instance [ Instance, Summary ]
  in 
    Model wizard (emptyPhysical) (emptyMachine) Dict.empty Dict.empty

type Msg = 
  WizardMsg Wizard.Msg
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

update : Msg -> Model-> Model
update msg ({wizard, physical, machine} as model) =
  case msg of
    WizardMsg msg -> 
      let
        ({errors} as newModel) = validatePhysical wizard.step model
        newWizard = Wizard.update (notAny errors) msg wizard
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

    SelectOS newOS -> 
      setMachine (\machine -> {machine | os = newOS }) model

    UserInput user -> 
       model 
        |> setMachine (\machine -> {machine | user = user })
        |> validate wizard.step "User" stringValidations
        

    HostnameInput host -> 
      model 
        |> setMachine (\machine -> {machine | hostname = host })
        |> validate wizard.step "Hostname" stringValidations
         
    DomainInput domain -> 
      model 
        |> setMachine (\machine -> {machine | domain = domain})
        |> validate wizard.step "Domain" stringValidations

    MacInput mac -> 
      setPhysical (\physical -> {physical| mac = Just mac}) model 

    BroadcastInput ip -> 
      setPhysical (\physical -> {physical| broadcast = Just ip}) model 

    IPInput ip -> 
      model 
        |> setMachine (\machine -> {machine | ip = Just ip })
        |> validate wizard.step "IP" stringValidations

next : Model -> Environment -> Model
next model environment =
      model 
         |> update (Update environment) 
         |> update (WizardMsg Wizard.Next)

back model =
  (update (WizardMsg Wizard.Back) model)


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

instance : Signal.Address Msg -> Model -> List Html
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

stepView :  Signal.Address Msg -> Model -> List Html
stepView address ({wizard, physical, machine} as model) =
  case wizard.step of
    Instance -> 
      instance address model 

    Summary -> 
      summarize (physical, machine)

    _ -> 
      Debug.log (toString wizard.step) [div [] []]


view : Model -> Html Msg
view model =
  fixedPanel (Html.form [] (stepView address model))
