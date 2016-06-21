module Systems.Add.KVM exposing (..)

import Bootstrap.Html exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (setDefaultOS, getOses, setMachine)
import Systems.View.KVM exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(KVM))
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, resourcedMachine)
import Systems.Model.KVM exposing (..)
import Platform.Cmd exposing (batch)
import Common.Components exposing (fixedPanel, asList, withErrors)
import Common.Utils exposing (withDefaultProp, defaultEmpty)
import String
import Maybe exposing (withDefault)
import Debug
import Common.Wizard as Wizard
import Common.Components exposing (..)
import Common.Utils exposing (none)

type alias Model = 
  {
    wizard : (Wizard.Model Step)
  , kvm : KVM
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)

  }
 
init : Model
init =
  let 
    wizard = Wizard.init Zero Instance [ Instance, Summary ]
  in 
    Model wizard emptyKVM (resourcedMachine 1 512) Dict.empty Dict.empty

type Msg = 
  WizardMsg Wizard.Msg
   | Update Environment
   | SelectOS String
   | SelectNode String
   | UserInput String
   | CpuInput String
   | RamInput String
   | HostnameInput String
   | DomainInput String
   | NoOp


type Step = 
  Zero
  | Instance
  | Summary


-- Update 

stringValidations = Dict.fromList [
    vpair Instance [
        ("User", validationOf "User" [notEmpty] (\({machine} as model) -> machine.user))
      , ("Hostname", validationOf "Hostname" [notEmpty] (\{machine} -> machine.hostname))
      , ("Domain", validationOf "Domain" [notEmpty] (\{machine} -> machine.domain))
    ]
 ]

getNodes model =
  let 
    hypervisor = withDefault ENV.Empty (Dict.get "kvm" model.environment)
  in 
    case hypervisor of
      ENV.KVM _ nodes -> 
        nodes

      _ -> 
        Dict.empty


setDefaultNode hyp ({kvm} as model) = 
   case List.head (Dict.keys (getNodes model)) of
     Just node -> 
       if (String.isEmpty kvm.node) then
         { model | kvm = {kvm | node = node}}
       else 
         model

     Nothing -> 
       model


validateKvm = validateAll [stringValidations]

next : Model -> Environment -> Model
next model environment =
      model 
         |> update (Update environment) 
         |> update (WizardMsg Wizard.Next)

back model =
  (update (WizardMsg Wizard.Back) model)

setKVM : (KVM -> KVM) -> Model -> Model
setKVM f ({kvm, errors} as model) =
  let
    newKvm = f kvm
  in
   { model | kvm = newKvm }

update : Msg ->  Model -> Model
update msg ({wizard} as model) =
  case msg of 
    WizardMsg msg -> 
      let
        ({errors} as newModel) = (validateKvm wizard.step model)
        newWizard = Wizard.update (notAny errors) msg wizard
      in
       { newModel | wizard = newWizard } 

    Update environment -> 
      setDefaultOS "kvm" { model | environment = environment} 
        |> setDefaultNode model

    SelectOS os -> 
      setMachine (\machine -> {machine | os = os }) model

    SelectNode node -> 
      setKVM (\kvm -> {kvm | node = node }) model

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

    CpuInput count -> 
      case Debug.log "" (String.toInt count) of
        Ok num -> 
          model 
            |> setMachine (\machine -> {machine | cpu = Just num })

        Err _ -> 
          model

    RamInput count -> 
      case (String.toInt count) of
        Ok num -> 
          model 
            |> setMachine (\machine -> {machine | ram = Just num})

        Err _ -> 
          model


    _ -> 
      model

-- View

instance : Signal.Address Msg -> Model -> List Html
instance address ({kvm, machine, errors} as model) =
  let
    check = withErrors errors
    oses = (Dict.keys (getOses "kvm" model))
    nodes = (Dict.keys (getNodes model))
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ 
         legend [] [text "Domain"]
       , group' "OS" (selector address SelectOS oses machine.os)
       , group' "Node" (selector address SelectNode nodes kvm.node)
       , legend [] [text "Resources"]
       , check  "Cpu" (inputText address CpuInput "" (toString (withDefault 0 machine.cpu)))
       , check  "Ram (mb)" (inputText address RamInput "" (toString (withDefault 0 machine.ram)))
       , legend [] [text "Network"]
       , check "User" (inputText address UserInput "" machine.user) 
       , check "Hostname" (inputText address HostnameInput "" machine.hostname)
       , check "Domain"  (inputText address DomainInput "" machine.domain)
       ]
    ]

stepView :  Signal.Address Msg -> Model -> List Html
stepView address ({wizard, kvm, machine} as model) =
  case wizard.step of
    Instance -> 
      instance address model 
 
    Summary -> 
      summarize (kvm, machine)
 
    _ -> 
      [div [] []]


view : Model -> Html Msg
view model =
  fixedPanel (Html.form [] (stepView address model))
