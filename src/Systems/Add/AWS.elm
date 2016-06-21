module Systems.Add.AWS exposing (..)

import Bootstrap.Html exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
import Systems.View.AWS exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(OSTemplates))
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.AWS exposing (..)
import Platform.Cmd exposing (batch)
import Common.Components exposing (fixedPanel, asList)
import Common.Utils exposing (withDefaultProp, defaultEmpty)
import String
import Maybe exposing (withDefault)
import Common.Wizard as Wizard
import Dict as Dict exposing (Dict)
import Common.Components exposing (..)

-- Model 

type alias Model = 
  { 
    wizard : (Wizard.Model Step)
  , aws : AWS
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  , volume : Volume
  , block : Block
  }

init : Model
init =
  let 
    wizard = Wizard.init Zero Instance [ Instance, Networking, EBS, Store, Summary ]
  in 
    Model wizard emptyAws emptyMachine Dict.empty Dict.empty emptyVolume emptyBlock

type Action = 
  WizardAction Wizard.Action
   | Update Environment
   | SelectInstanceType String
   | SelectOS String
   | SelectEndpoint String
   | SelectZone String
   | KeyPairInput String
   | SecurityGroupsInput String
   | UserInput String
   | HostnameInput String
   | DomainInput String
   | IPInput String
   | SelectEBSType String
   | EBSSizeInput String
   | EBSIOPSInput String
   | EBSDeviceInput String
   | VolumeAdd
   | VolumeRemove String
   | EBSOptimized
   | EBSClear
   | VPCIdInput String
   | SubnetIdInput String
   | AssignIp
   | InstanceDeviceInput String
   | InstanceVolumeInput String
   | BlockAdd
   | BlockRemove String


type Step = 
  Zero
  | Instance
  | Networking
  | EBS
  | Store
  | Summary

-- Update

setAWS : (AWS -> AWS) -> Model -> Model
setAWS f ({aws, errors} as model) =
  let
    newAws = f aws
  in
   { model | aws = newAws }

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

stringValidations = Dict.fromList [
    vpair Networking [
        ("Hostname", validationOf "Hostname" [notEmpty] (\({machine} as model) -> machine.hostname))
      , ("Domain", validationOf "Domain" [notEmpty] (\({machine} as model) -> machine.domain))
      , ("IP", validationOf "IP" [validIp] (\{machine} -> withDefault "" machine.ip))
      , ("VPC Id", validationOf "VPC Id" [validId 12 "vpc-" True] (\{aws} -> withDefaultProp aws.vpc "" .vpcId))
      , ("Subnet Id", validationOf "Subnet Id" [validId 15 "subnet-" True] (\{aws} -> withDefaultProp aws.vpc "" .subnetId))
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

tupleValidations = Dict.fromList [
  vpair EBS [
    ("EBS Device", validationOf "EBS Device" [notContained] (\{volume, aws} -> (volume.device, (List.map .device (defaultEmpty aws.volumes)))))
  ] ,
  vpair Store [
     ("Instance Device", validationOf "Instance Device" [notContained] (\{block, aws} -> (block.device, (List.map .device (defaultEmpty aws.blockDevices)))))
   , ("Volume", validationOf "Volume" [notContained] (\{block, aws} -> (block.volume, (List.map .volume (withDefault [] aws.blockDevices)))))

  ]
 ]

validateAWS = validateAll [listValidations, stringValidations]

ignoreDevices: Model-> Model
ignoreDevices ({errors} as model) =
  let 
    ignored  = errors |> Dict.remove "EBS Device" 
                      |> Dict.remove "Instance Device"
                      |> Dict.remove "Volume"
  in 
    { model | errors =  ignored }


update : Action -> Model-> Model
update action ({wizard, aws, machine, volume, block} as model) =
  case action of
    WizardAction action -> 
      let
        ({errors} as newModel) = ignoreDevices (validateAWS wizard.step model)
        newWizard = Wizard.update (notAny errors) action wizard
      in
       { newModel | wizard = newWizard } 

    Update environment -> 
       (setDefaultOS "aws" { model | environment = environment })

    SelectInstanceType type' -> 
      setAWS (\aws -> {aws | instanceType = type' }) model

    SelectOS os -> 
      setMachine (\machine -> {machine | os = os }) model
    
    SelectEndpoint point -> 
      let
        (_,url,_) = withDefault ("","",[]) (List.head (List.filter (\(name,url,zones) -> name == point) (Dict.values endpoints)))
      in 
        setAWS (\aws -> {aws | endpoint = url }) model 

    SelectZone zone -> 
      setAWS (\aws -> {aws | availabilityZone = (Just zone) }) model 

    KeyPairInput key -> 
      model 
        |> setAWS (\aws -> {aws | keyName = key }) 
        |> validate wizard.step "Keypair" stringValidations

    SecurityGroupsInput groups -> 
      let
        splited = String.split " " groups 
      in
        model  
          |>  setAWS (\aws -> {aws | securityGroups = Just (if splited == [""] then [] else splited)})
          |>  validate wizard.step "Security groups" listValidations

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
        |> setMachine (\machine -> {machine | ip = Just ip })
        |> validate wizard.step "IP" stringValidations

    VPCIdInput vpcId -> 
      let
        newVpc = withDefault emptyVpc aws.vpc
      in
        model 
          |> setAWS (\aws -> {aws | vpc = Just { newVpc | vpcId = vpcId }})
          |> validate wizard.step "VPC Id" stringValidations

    SubnetIdInput subnetId -> 
      let
        newVpc = withDefault emptyVpc aws.vpc
      in
        model 
          |> setAWS (\aws -> {aws | vpc = Just { newVpc | subnetId = subnetId }})
          |> validate wizard.step "Subnet Id" stringValidations

    AssignIp -> 
      let
        newVpc = withDefault emptyVpc aws.vpc
      in
        setAWS (\aws -> {aws | vpc = Just { newVpc | assignPublic = not newVpc.assignPublic }}) model

    SelectEBSType type' ->
       setVolume (\volume -> {volume | type' = type'}) model

    EBSSizeInput size -> 
      case (String.toInt size) of
        Ok num -> 
          setVolume (\volume -> { volume | size = num}) model

        Err _ -> 
          model

    EBSIOPSInput iops -> 
      case (String.toInt iops) of
        Ok num -> 
          setVolume (\volume -> { volume | iops = (Just num)}) model

        Err _ -> 
          model

    EBSDeviceInput device -> 
      model 
        |> setVolume (\volume -> { volume | device = device})
        |> validate wizard.step "EBS Device" tupleValidations

    EBSOptimized -> 
      setAWS (\aws -> {aws | ebsOptimized = Just (not (withDefault False aws.ebsOptimized))}) model

    EBSClear -> 
      setVolume (\volume -> { volume | clear = not volume.clear}) model

    VolumeAdd -> 
      let 
        ({errors} as newModel) = validate wizard.step "EBS Device" tupleValidations model
        newAws = {aws | volumes = Just (List.append [volume] (defaultEmpty aws.volumes)) } 
      in 
        if notAny errors then
          { newModel | volume = emptyVolume, aws = newAws }
        else 
          { newModel | aws = aws }
        
    InstanceDeviceInput device -> 
      model 
        |> setBlock (\block -> { block | device = device})
        |> validate wizard.step "Instance Device" tupleValidations

    InstanceVolumeInput volume -> 
      model 
        |> setBlock (\block -> { block | volume = volume})
        |> validate wizard.step "Volume" tupleValidations

    BlockAdd -> 
      let 
        ({errors} as newModel) = model 
                                  |> validate wizard.step "Instance Device" tupleValidations 
                                  |> validate wizard.step "Volume" tupleValidations 
        newAws = { aws | blockDevices = Just (List.append [block] (defaultEmpty aws.blockDevices)) } 
      in 
        if notAny errors then
          { newModel | block = emptyBlock, aws = newAws }
        else 
          { newModel | aws = aws }
        
    VolumeRemove device -> 
      let 
        newVolumes = (List.filter (\volume -> volume.device /= device) (defaultEmpty aws.volumes))
        newAws = { aws | volumes = Just newVolumes} 
      in 
        { model | aws = newAws } 

    BlockRemove device -> 
      let 
        newBlocks = (List.filter (\block -> block.device /= device) (defaultEmpty aws.blockDevices))
        newAws = { aws | blockDevices = Just newBlocks} 
      in 
        { model | aws = newAws } 

next : Model -> Environment -> Model
next model environment =
      model 
         |> update (Update environment) 
         |> update (WizardAction Wizard.Next)

back model =
  (update (WizardAction Wizard.Back) model)

instance : Signal.Address Action -> Model -> List Html
instance address ({aws, machine, errors} as model) =
  let
    check = withErrors errors
    groups = (String.join " " (defaultEmpty aws.securityGroups))
    points = (List.map (\(name,_,_) -> name) (Dict.values endpoints))
    zone = withDefault "" (List.head (Dict.keys (Dict.filter (\k (name,url,zones) -> url == aws.endpoint) endpoints)))
    (name,_,zones) = withDefault ("","",[]) (Dict.get zone endpoints)
    zoneOptions = (List.append [""] (List.map (\k -> zone ++ k) zones))
  in
    [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
       [ 
         legend [] [text "Properties"]
       , group' "Instance type" (selector address SelectInstanceType instanceTypes aws.instanceType)
       , group' "OS" (selector address SelectOS (Dict.keys (getOses "aws" model)) machine.os)
       , group' "Endpoint" (selector address SelectEndpoint points name)
       , group' "Availability Zone" (selector address SelectZone zoneOptions (withDefault "" aws.availabilityZone))
       , legend [] [text "Security"]
       , check "User" (inputText address UserInput "" model.machine.user) 
       , check "Keypair" (inputText address KeyPairInput "" aws.keyName)
       , check "Security groups" (inputText address SecurityGroupsInput " " groups)]
   ]

networking: Signal.Address Action -> Model -> List Html
networking address ({errors, aws, machine} as model) =
  let 
    check = withErrors errors
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
     [
       legend [] [text "DNS"]
     , check "Hostname" (inputText address HostnameInput "" machine.hostname)
     , check "Domain"  (inputText address DomainInput "" machine.domain)
     , check "IP" (inputText address IPInput "" (withDefault "" machine.ip))
     , legend [] [text "VPC"]
     , check "VPC Id" (inputText address VPCIdInput "" (withDefaultProp aws.vpc "" .vpcId))
     , check "Subnet Id"  (inputText address SubnetIdInput "" (withDefaultProp aws.vpc "" .subnetId))
     , group' "Assign public IP" (checkbox address AssignIp (withDefaultProp aws.vpc False .assignPublic))
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
    props = [.device, (toString << .size), .type', (toString << .clear)]
  in
    tr [] (List.append (List.map (\prop -> td [] [text (prop v)]) props) [remove])

volumes : Signal.Address Action -> List Volume -> Html
volumes address vs = 
  div [class "col-md-8 col-md-offset-2 "] [
    table [class "table", id "ebsVolumes"]
     [thead []
        [tr [] (List.map (\k ->  (th [] [text k])) ["device", "size", "type", "clear", ""])]
         , tbody [] 
            (List.map (\volume -> volumeRow address volume) vs)
 
     ]
  ]

blockRow : Signal.Address Action -> Block -> Html
blockRow address ({device} as v) = 
  let
    remove = span [ class "glyphicon glyphicon-remove"
                  , attribute "aria-hidden" "true"
                  , style [("top", "5px")]
                  , onClick address (BlockRemove device)
                  ] []
    props = [.device, .volume ]
  in
    tr [] (List.append (List.map (\prop -> td [] [text (prop v)]) props) [remove])


blocks: Signal.Address Action -> List Block -> Html
blocks address bs = 
  div [class "col-md-8 col-md-offset-2 "] [
    table [class "table", id "instanceVolumes"]
     [thead_
        [tr [] (List.map (\k ->  (th [] [text k])) ["device", "volume", ""])]
         , tbody [] 
            (List.map (\block-> blockRow address block) bs)
     ]
  ]   

ebs: Signal.Address Action -> Model -> List Html
ebs address ({errors, volume, aws} as model) =
  let
    check = withErrors errors
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
    [ 
      legend [] [text "Global"]
    , group' "EBS Optimized" (checkbox address EBSOptimized (withDefault False aws.ebsOptimized))
    , legend [] [text "Devices"]
    , check "EBS Device" (inputText address EBSDeviceInput "sdh" volume.device)
    , group' "Size" (inputNumber address EBSSizeInput "" (toString volume.size))
    , group' "Type" (selector address SelectEBSType (Dict.keys ebsTypes) volume.type')
    , if volume.type' == "Provisioned IOPS (SSD)" then 
        group' "IOPS" (inputNumber address EBSIOPSInput "50" (toString (withDefault 50 volume.iops)))
      else 
        div  [] []
    , group' "Clear" (checkbox address EBSClear volume.clear)
    , group' ""  (button [class "btn btn-sm col-md-2", onClick address VolumeAdd] [text "Add"])
    , legend [] [text "Volumes"]
    , volumes address (defaultEmpty aws.volumes)
    ]
  ]

store: Signal.Address Action -> Model -> List Html
store address ({errors, block, aws} as model) =
  let
    check = withErrors errors
  in
  [div [class "form-horizontal", attribute "onkeypress" "return event.keyCode != 13;" ] 
    [ 
      legend [] [text "Instance Store"]
    , check "Instance Device" (inputText address InstanceDeviceInput "sdb" block.device)
    , check "Volume" (inputText address InstanceVolumeInput "ephemeral0" block.volume)
    , group' ""  (button [class "btn btn-sm col-md-2", onClick address BlockAdd] [text "Add"])
    , blocks address (defaultEmpty aws.blockDevices)
    ]
  ]


stepView :  Signal.Address Action -> Model -> List Html
stepView address ({wizard, aws, machine} as model) =
  case wizard.step of
    Instance -> 
      instance address model 

    Networking -> 
      networking address model

    EBS -> 
      ebs address model

    Store -> 
      store address model

    Summary -> 
      summarize (aws, machine)

    _ -> 
      Debug.log (toString wizard.step) [div [] []]


view : Signal.Address Action -> Model -> Html
view address model =
  fixedPanel (Html.form [] (stepView address model))
