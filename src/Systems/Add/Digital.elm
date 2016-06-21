module Systems.Add.Digital exposing (..)

import Bootstrap.Html exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
import Systems.View.Digital exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(OSTemplates))
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.Digital exposing (..)
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
  , digital : Digital
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  }

init : Model
init =
  let 
    wizard = Wizard.init Zero Instance [ Instance, Summary ]
  in 
    Model wizard emptyDigital emptyMachine Dict.empty Dict.empty

type Action = 
  WizardAction Wizard.Action
  | Update Environment
  | SelectSize String
  | SelectOS String
  | PrivateNetworking
  | SelectRegion String
  | UserInput String
  | HostnameInput String
  | DomainInput String

type Step = 
  Zero
  | Instance
  | Summary

-- Update

setDigital : (Digital -> Digital) -> Model -> Model
setDigital f ({digital, errors} as model) =
  let
    newDigital = f (Debug.log "" digital)
  in
   { model | digital = newDigital}


stringValidations = Dict.fromList [
    vpair Instance [
        ("Hostname", validationOf "Hostname" [notEmpty] (\({machine} as model) -> machine.hostname))
      , ("Domain", validationOf "Domain" [notEmpty] (\({machine} as model) -> machine.domain))
      , ("User", validationOf "User" [notEmpty] (\({machine} as model) -> machine.user))
    ]
 ]

validateDigital = validateAll [stringValidations]

update : Action -> Model-> Model
update action ({wizard, digital, machine} as model) =
  case action of
    WizardAction action -> 
      let
        ({errors} as newModel) = (validateDigital wizard.step model)
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

    SelectSize size -> 
      setDigital (\digital-> {digital | size = size }) model

    SelectOS newOS -> 
      setMachine (\machine -> {machine | os = newOS }) model

    SelectRegion region -> 
      setDigital (\digital-> {digital | region = region }) model 

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

    PrivateNetworking -> 
       setDigital (\digital -> {digital | privateNetworking = (not (digital.privateNetworking))}) model

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
    hypervisor = withDefault (OSTemplates Dict.empty) (Dict.get "digital-ocean" model.environment)
  in 
    case hypervisor of
      OSTemplates oses -> 
        oses
      _ -> 
        Dict.empty

instance : Signal.Address Action -> Model -> List Html
instance address ({digital, machine, errors} as model) =
  let
    check = withErrors errors
    region = withDefault "" (List.head regions)
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ 
         legend [] [text "Properties"]
       , group' "Size" (selector address SelectSize sizes digital.size)
       , group' "OS" (selector address SelectOS (Dict.keys (getOses model)) machine.os) , group' "Region" (selector address SelectRegion regions digital.region)
       , legend [] [text "Security"]
       , check "User" (inputText address UserInput "" machine.user) 
       , legend [] [text "Networking"]
       , check "Hostname" (inputText address HostnameInput "" machine.hostname)
       , check "Domain"  (inputText address DomainInput "" machine.domain)
       , group' "Private Networking" (checkbox address PrivateNetworking digital.privateNetworking)
       ]
    ]

stepView :  Signal.Address Action -> Model -> List Html
stepView address ({wizard, digital, machine} as model) =
  case wizard.step of
    Instance -> 
      instance address model 

    Summary -> 
      summarize (digital, machine)

    _ -> 
      Debug.log (toString wizard.step) [div [] []]


view : Signal.Address Action -> Model -> Html
view address model =
  fixedPanel (Html.form [] (stepView address model))
