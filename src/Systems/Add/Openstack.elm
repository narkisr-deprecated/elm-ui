module Systems.Add.Openstack where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
-- import Systems.View.Openstack exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(OSTemplates))
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.Openstack exposing (..)
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
  , openstack : Openstack
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  , volume : Volume
  }

init : (Model , Effects Action)
init =
  let 
    steps = [ Instance, Networking, Cinder, Summary ]
  in 
  (Model Zero [] steps (emptyOpenstack) (emptyMachine) Dict.empty Dict.empty (emptyVolume) , Effects.none)

type Action = 
  Next 
  | Back 
  | Update Environment
  | SelectFlavor String
  | SelectOS String
  | KeyPairInput String
  | SecurityGroupsInput String
  | UserInput String
  | HostnameInput String
  | DomainInput String
  | IPInput String
  | CinderSizeInput String
  | CinderDeviceInput String
  | CinderClear
  | VolumeAdd
  | VolumeRemove String


type Step = 
  Zero
  | Instance
  | Networking
  | Cinder
  | Summary

-- Update

setOpenstack : (Openstack -> Openstack) -> Model -> Model
setOpenstack f ({openstack, errors} as model) =
  let
    newOpenstack = f openstack
  in
   { model | openstack = newOpenstack }

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
      , ("Keypair", validationOf "Keypair" [notEmpty] (\({openstack} as model) -> openstack.keyName))
    ]
 ]

  
listValidations = Dict.fromList [
    vpair Instance [
      ("Security groups", validationOf "Security groups" [hasItems] (\({openstack} as model) -> (defaultEmpty openstack.securityGroups)))
    ]
 ]

tupleValidations = Dict.fromList [
  vpair Cinder [
    ("Cinder Device", validationOf "Cinder Device" [notContained] (\{volume, openstack} -> (volume.device, (List.map .device (defaultEmpty openstack.volumes)))))
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

ignoreDevices: Model-> Model
ignoreDevices ({errors} as model) =
  let 
    ignored  = errors |> Dict.remove "Cinder Device" 
                      |> Dict.remove "Instance Device"
                      |> Dict.remove "Volume"
  in 
    { model | errors =  ignored }

update : Action -> Model-> Model
update action ({next, prev, step, openstack, machine, volume} as model) =
  case action of
    Next -> 
      let
        nextStep = withDefault Instance (List.head next)
        nextSteps = defaultEmpty (List.tail next)
        prevSteps = if step /= Zero then List.append prev [step] else prev
        ({errors} as newModel) = ignoreDevices (validateAll step model)
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
        ({errors} as newModel) = ignoreDevices (validateAll step model)
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

    SelectFlavor flavor -> 
      setOpenstack (\openstack -> {openstack | flavor = flavor }) model

    SelectOS os -> 
      setMachine (\machine -> {machine | os = os }) model
    
    KeyPairInput key -> 
      model 
        |> setOpenstack (\openstack -> {openstack | keyName = key }) 
        |> validate step "Keypair" stringValidations

    SecurityGroupsInput groups -> 
      let
        splited = String.split " " groups 
      in
        model  
          |>  setOpenstack (\openstack -> {openstack | securityGroups = Just (if splited == [""] then [] else splited)})
          |>  validate step "Security groups" listValidations

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

    CinderSizeInput size -> 
      case (String.toInt size) of
        Ok num -> 
          setVolume (\volume -> { volume | size = num}) model
        Err _ -> 
          model

    CinderDeviceInput device -> 
      model 
        |> setVolume (\volume -> { volume | device = device})
        |> validate step "Cinder Device" tupleValidations

    CinderClear -> 
      setVolume (\volume -> { volume | clear = not volume.clear}) model

    VolumeAdd -> 
      let 
        ({errors} as newModel) = validate step "Cinder Device" tupleValidations model
        newOpenstack = {openstack | volumes = Just (List.append [volume] (defaultEmpty openstack.volumes)) } 
      in 
        if notAny errors then
          { newModel | volume = emptyVolume, openstack = newOpenstack }
        else 
          { newModel | openstack = openstack }
        
    VolumeRemove device -> 
      let 
        newVolumes = (List.filter (\volume -> volume.device /= device) (defaultEmpty openstack.volumes))
        newOpenstack = { openstack | volumes = Just newVolumes} 
      in 
        { model | openstack = newOpenstack } 

    
hasNext : Model -> Bool
hasNext model =
  not (List.isEmpty model.next)

hasPrev : Model -> Bool
hasPrev model =
  not (List.isEmpty model.prev)



getOses : Model -> Dict String Template
getOses model =
  let 
    hypervisor = withDefault (OSTemplates Dict.empty) (Dict.get "openstack" model.environment)
  in 
    case hypervisor of
      OSTemplates oses -> 
        oses
      _ -> 
        Dict.empty


instance : Signal.Address Action -> Model -> List Html
instance address ({openstack, machine, errors} as model) =
  let
    check = withErrors errors
    groups = (String.join " " (defaultEmpty openstack.securityGroups))
    flavors = []
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ 
         legend [] [text "Properties"]
       , group' "Flavor" (selector address SelectFlavor flavors openstack.flavor)
       , group' "OS" (selector address SelectOS (Dict.keys (getOses model)) machine.os)
       , legend [] [text "Security"]
       , check "User" (inputText address UserInput "" model.machine.user) 
       , check "Keypair" (inputText address KeyPairInput "" openstack.keyName)
       , check "Security groups" (inputText address SecurityGroupsInput " " groups)]
   ]

withErrors : Dict String (List Error) -> String ->  Html -> Html
withErrors errors key widget =
  group key widget (defaultEmpty  (Dict.get key errors))

networking: Signal.Address Action -> Model -> List Html
networking address ({errors, openstack, machine} as model) =
  let 
    check = withErrors errors
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
     [
       legend [] [text "DNS"]
     , check "Hostname" (inputText address HostnameInput "" machine.hostname)
     , check "Domain"  (inputText address DomainInput "" machine.domain)
     , check "IP" (inputText address IPInput "" (withDefault "" machine.ip))
     ]
  ]

ebsTypes = Dict.fromList [
     ("Magnetic", "standard")
   , ("General Purpose (SSD)", "gp2")
   , ("Provisioned IOPS (SSD)", "io1")
  ]

volumeRow : Signal.Address Action -> Volume -> Html
volumeRow address ({device} as v) = 
  let
    remove = span [ class "glyphicon glyphicon-remove"
                  , attribute "aria-hidden" "true"
                  , style [("top", "5px")]
                  , onClick address (VolumeRemove device)
                  ] []
    props = [.device, (toString << .size), (toString << .clear)]
  in
    tr [] (List.append (List.map (\prop -> td [] [text (prop v)]) props) [remove])

volumes : Signal.Address Action -> List Volume -> Html
volumes address vs = 
  div [class "col-md-8 col-md-offset-2 "] [
    table [class "table", id "ebsVolumes"]
     [thead []
        [tr [] (List.map (\k ->  (th [] [text k])) ["device", "size", "clear", ""])]
         , tbody [] 
            (List.map (\volume -> volumeRow address volume) vs)
 
     ]
  ]


cinder: Signal.Address Action -> Model -> List Html
cinder address ({errors, volume, openstack} as model) =
  let
    check = withErrors errors
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
    [ 
      legend [] [text "Devices"]
    , check "Device" (inputText address CinderDeviceInput "sdh" volume.device)
    , group' "Size" (inputNumber address CinderSizeInput "" (toString volume.size))
    , group' "Clear" (checkbox address CinderClear volume.clear)
    , group' ""  (button [class "btn btn-sm col-md-2", onClick address VolumeAdd] [text "Add"])
    , legend [] [text "Volumes"]
    , volumes address (defaultEmpty openstack.volumes)
    ]
  ]

stepView :  Signal.Address Action -> Model -> List Html
stepView address ({openstack, machine} as model) =
  case model.step of
    Instance -> 
      instance address model 

    Networking -> 
      networking address model

    Cinder -> 
      cinder address model

    Summary -> 
      [div  [] [ ]]
      -- summarize (openstack, machine)

    _ -> 
      Debug.log (toString model.step) [div [] []]


view : Signal.Address Action -> Model -> List Html
view address ({step} as model)=
  panelContents (toString step) (Html.form [] (stepView address model))
