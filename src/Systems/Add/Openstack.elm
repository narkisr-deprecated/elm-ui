module Systems.Add.Openstack exposing (..)

import Bootstrap.Html exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
import Systems.View.Openstack exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(Openstack))
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.Openstack exposing (..)
import Platform.Cmd exposing (batch)
import Common.Components exposing (fixedPanel, asList)
import Common.Utils exposing (withDefaultProp, defaultEmpty)
import String
import Maybe exposing (withDefault)
import Debug
import Common.Wizard as Wizard
import Common.Components exposing (..)
import Common.Utils exposing (none)

-- Model

type alias Model =
  {
    wizard : (Wizard.Model Step)
  , openstack : Openstack
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  , volume : Volume
  }

init : Model
init =
  let
    wizard = Wizard.init Zero Instance [ Instance, Networking, Cinder, Summary ]
  in
    Model wizard emptyOpenstack emptyMachine Dict.empty Dict.empty emptyVolume

type Msg =
  WizardMsg Wizard.Msg
   | Update Environment
   | SelectFlavor String
   | SelectOS String
   | KeyPairInput String
   | SecurityGroupsInput String
   | UserInput String
   | TenantInput String
   | HostnameInput String
   | DomainInput String
   | IPInput String
   | IPPoolInput String
   | NetworksInput String
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

setVolume : (Volume -> Volume) -> Model -> Model
setVolume f ({volume} as model) =
  let
    newVolume = f volume
  in
    { model | volume = newVolume }

stringValidations = Dict.fromList [
    vpair Networking [
        ("Hostname", validationOf "Hostname" [notEmpty] (\{machine} -> machine.hostname))
      , ("Domain", validationOf "Domain" [notEmpty] (\{machine} -> machine.domain))
      , ("IP", validationOf "IP" [validIp]  (\{openstack} -> withDefault "" openstack.floatingIp))
    ]
  , vpair Instance [
        ("User", validationOf "User" [notEmpty] (\({machine} as model) -> machine.user))
      , ("Keypair", validationOf "Keypair" [notEmpty] (\({openstack} as model) -> openstack.keyName))
      , ("Tenant", validationOf "Tenant" [notEmpty] (\{openstack} -> openstack.tenant))
    ]
 ]

listValidations = Dict.fromList [
    vpair Instance [
      ("Security groups", validationOf "Security groups" [hasItems] (\({openstack} as model) -> (defaultEmpty openstack.securityGroups)))
    ],
   vpair Networking [
      ("Networks", validationOf "Networks" [hasItems] (\({openstack} as model) -> openstack.networks))
    ]
 ]

tupleValidations = Dict.fromList [
  vpair Cinder [
    ("Cinder Device", validationOf "Cinder Device" [notContained] (\{volume, openstack} -> (volume.device, (List.map .device (defaultEmpty openstack.volumes)))))
  ]
 ]

ignoreDevices: Model-> Model
ignoreDevices ({errors} as model) =
  let
    ignored  = errors |> Dict.remove "Cinder Device"
                      |> Dict.remove "Instance Device"
                      |> Dict.remove "Volume"
  in
    { model | errors =  ignored }

getFlavors model =
  let
    hypervisor = withDefault ENV.Empty (Dict.get "openstack" model.environment)
  in
    case hypervisor of
      ENV.Openstack flavors _ ->
        flavors
      _ ->
        Dict.empty


setDefaultFlavor hyp ({openstack} as model) =
   case List.head (Dict.keys (getFlavors model)) of
     Just flavor ->
       if (String.isEmpty openstack.flavor) then
         { model | openstack = {openstack | flavor = flavor }}
       else
         model

     Nothing ->
       model

validateOpenstack = validateAll [stringValidations, listValidations]

update : Msg -> Model-> Model
update msg ({wizard, openstack, machine, volume} as model) =
  case msg of
    WizardMsg msg ->
      let
        ({errors} as newModel) = ignoreDevices (validateOpenstack wizard.step model)
        newWizard = Wizard.update (notAny errors) msg wizard
      in
       { newModel | wizard = newWizard }

    Update environment ->
      setDefaultOS "openstack" { model | environment = environment}
        |> setDefaultFlavor model

    SelectFlavor flavor ->
      setOpenstack (\openstack -> {openstack | flavor = flavor }) model

    SelectOS os ->
      setMachine (\machine -> {machine | os = os }) model

    TenantInput tenant ->
      model
        |> setOpenstack (\openstack -> {openstack | tenant = tenant })
        |> validate wizard.step "Tenant" stringValidations


    KeyPairInput key ->
      model
        |> setOpenstack (\openstack -> {openstack | keyName = key })
        |> validate wizard.step "Keypair" stringValidations

    SecurityGroupsInput groups ->
      let
        splited = String.split " " groups
      in
        model
          |>  setOpenstack (\openstack -> {openstack | securityGroups = Just (if splited == [""] then [] else splited)})
          |>  validate wizard.step "Security groups" listValidations


    NetworksInput networks ->
      let
        splited = String.split " " networks
      in
        model
          |>  setOpenstack (\openstack -> {openstack | networks = splited})
          |>  validate wizard.step "Networks" listValidations


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

    IPInput ip ->
      model
        |> setOpenstack (\openstack -> {openstack | floatingIp = Just ip })
        |> validate wizard.step "IP" stringValidations

    IPPoolInput pool ->
      model
        |> setOpenstack (\openstack -> {openstack | floatingIpPool = Just pool })

    CinderSizeInput size ->
      case (String.toInt size) of
        Ok num ->
          setVolume (\volume -> { volume | size = num}) model
        Err _ ->
          model

    CinderDeviceInput device ->
      model
        |> setVolume (\volume -> { volume | device = device})
        |> validate wizard.step "Cinder Device" tupleValidations

    CinderClear ->
      setVolume (\volume -> { volume | clear = not volume.clear}) model

    VolumeAdd ->
      let
        ({errors} as newModel) = validate wizard.step "Cinder Device" tupleValidations model
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

next : Model -> Environment -> Model
next model environment =
      model
         |> update (Update environment)
         |> update (WizardMsg Wizard.Next)

back model =
  (update (WizardMsg Wizard.Back) model)

instance : Model -> List (Html Msg)
instance ({openstack, machine, errors} as model) =
  let
    check = withErrors errors
    groups = (String.join " " (defaultEmpty openstack.securityGroups))
    flavors = (Dict.keys (getFlavors model))
    oses = (Dict.keys (getOses "openstack" model))
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ]
       [
         legend [] [text "Properties"]
       , group' "Flavor" (selector SelectFlavor flavors openstack.flavor)
       , group' "OS" (selector SelectOS oses machine.os)
       , check "Tenant" (inputText TenantInput "" openstack.tenant)
       , legend [] [text "Security"]
       , check "User" (inputText UserInput "" machine.user)
       , check "Keypair" (inputText KeyPairInput "" openstack.keyName)
       , check "Security groups" (inputText SecurityGroupsInput " " groups)]
   ]

networking: Model -> List (Html Msg)
networking ({errors, openstack, machine} as model) =
  let
    check = withErrors errors
    networks = (String.join " " openstack.networks)
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ]
     [
       legend [] [text "Networking"]
     , check "Hostname" (inputText HostnameInput "" machine.hostname)
     , check "Domain"  (inputText DomainInput "" machine.domain)
     , check "IP" (inputText IPInput "" (withDefault "" openstack.floatingIp))
     , check "IP-Pool" (inputText IPPoolInput "" (withDefault "" openstack.floatingIpPool))
     , check "Networks" (inputText NetworksInput " " networks)
     ]
  ]

volumeRow : Volume -> Html Msg
volumeRow ({device} as v) =
  let
    remove = span [ class "glyphicon glyphicon-remove"
                  , attribute "aria-hidden" "true"
                  , style [("top", "5px")]
                  , onClick (VolumeRemove device)
                  ] []
    props = [.device, (toString << .size), (toString << .clear)]
  in
    tr [] (List.append (List.map (\prop -> td [] [text (prop v)]) props) [remove])

volumes : List Volume -> Html Msg
volumes vs =
  div [class "col-md-8 col-md-offset-2 "] [
    table [class "table", id "ebsVolumes"]
     [thead []
        [tr [] (List.map (\k ->  (th [] [text k])) ["device", "size", "clear", ""])]
         , tbody []
            (List.map (\volume -> volumeRow volume) vs)

     ]
  ]


cinder: Model -> List (Html Msg)
cinder ({errors, volume, openstack} as model) =
  let
    check = withErrors errors
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ]
    [
      legend [] [text "Devices"]
    , check "Cinder Device" (inputText CinderDeviceInput "sdh" volume.device)
    , group' "Size" (inputNumber CinderSizeInput "" (toString volume.size))
    , group' "Clear" (checkbox CinderClear volume.clear)
    , group' ""  (button [class "btn btn-sm col-md-2", onClick VolumeAdd] [text "Add"])
    , legend [] [text "Volumes"]
    , volumes (defaultEmpty openstack.volumes)
    ]
  ]

stepView :  Model -> List (Html Msg)
stepView ({wizard, openstack, machine} as model) =
  case wizard.step of
    Instance ->
      instance model

    Networking ->
      networking model

    Cinder ->
      cinder model

    Summary ->
      summarize (openstack, machine)

    _ ->
      Debug.log (toString wizard.step) [div [] []]


view : Model -> Html Msg
view model =
  fixedPanel (Html.form [] (stepView model))
