module Systems.Add.KVM where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (setDefaultOS)
-- import Systems.View.Openstack exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(KVM))
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.KVM exposing (..)
import Effects exposing (Effects, batch)
import Common.Components exposing (fixedPanel, asList)
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
 
init : (Model , Effects Action)
init =
  let 
    wizard = Wizard.init Zero Instance [ Instance, Summary ]
  in 
    none (Model wizard emptyKVM emptyMachine Dict.empty Dict.empty)

type Action = 
  WizardAction Wizard.Action
   | Update Environment
   | SelectOS String
   | KeyPairInput String
   | UserInput String
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
      ENV.KVM nodes _ -> 
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

update : Action ->  Model -> Model
update action ({wizard} as model) =
  case action of 
    WizardAction action -> 
      let
        ({errors} as newModel) = (validateKvm wizard.step model)
        newWizard = Wizard.update (notAny errors) action wizard
      in
       { newModel | wizard = newWizard } 

    Update environment -> 
      setDefaultOS "kvm" { model | environment = environment} 
        |> setDefaultNode model

    _ -> 
      model

-- View

view : Signal.Address Action -> Model -> Html
view address model =
  div [] [
  ]
