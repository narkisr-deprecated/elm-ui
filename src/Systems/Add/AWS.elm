module Systems.Add.AWS where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class, id, for, rows, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Systems.Add.Common exposing (..)
import Systems.View.AWS exposing (summarize)
import Systems.Add.Validations exposing (..)
import Environments.List as ENV exposing (Environment, Template, Hypervisor(OSTemplates))
import Dict as Dict exposing (Dict)
import Systems.Model.Common exposing (Machine, emptyMachine)
import Systems.Model.AWS exposing (..)
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
  , aws : AWS
  , machine : Machine
  , environment : Environment
  , errors : Dict String (List Error)
  , volume : Volume
  , block : Block
  }

init : (Model , Effects Action)
init =
  let 
    steps = [ Instance, Networking, EBS, Store, Summary ]
  in 
  (Model Zero [] steps (emptyAws) (emptyMachine) Dict.empty Dict.empty (emptyVolume) (emptyBlock), Effects.none)

type Action = 
  Next 
  | Back 
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

setBlock : (Block -> Block)-> Model -> Model
setBlock f ({block} as model) =
  let
    newBlock = f block
  in
    { model | block = newBlock }  



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
    ignored  = errors |> Dict.remove "EBS Device" 
                      |> Dict.remove "Instance Device"
                      |> Dict.remove "Volume"
  in 
    { model | errors =  ignored }

update : Action -> Model-> Model
update action ({next, prev, step, aws, machine, volume, block} as model) =
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
        |> validate step "Keypair" stringValidations

    SecurityGroupsInput groups -> 
      let
        splited = String.split " " groups 
      in
        model  
          |>  setAWS (\aws -> {aws | securityGroups = Just (if splited == [""] then [] else splited)})
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

    VPCIdInput vpcId -> 
      let
        newVpc = withDefault emptyVpc aws.vpc
      in
        model 
          |> setAWS (\aws -> {aws | vpc = Just { newVpc | vpcId = vpcId }})
          |> validate step "VPC Id" stringValidations

    SubnetIdInput subnetId -> 
      let
        newVpc = withDefault emptyVpc aws.vpc
      in
        model 
          |> setAWS (\aws -> {aws | vpc = Just { newVpc | subnetId = subnetId }})
          |> validate step "Subnet Id" stringValidations

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
        |> validate step "EBS Device" tupleValidations

    EBSOptimized -> 
      setAWS (\aws -> {aws | ebsOptimized = Just (not (withDefault False aws.ebsOptimized))}) model

    EBSClear -> 
      setVolume (\volume -> { volume | clear = not volume.clear}) model

    VolumeAdd -> 
      let 
        ({errors} as newModel) = validate step "EBS Device" tupleValidations model
        newAws = {aws | volumes = Just (List.append [volume] (defaultEmpty aws.volumes)) } 
      in 
        if notAny errors then
          { newModel | volume = emptyVolume, aws = newAws }
        else 
          { newModel | aws = aws }
        
    InstanceDeviceInput device -> 
      model 
        |> setBlock (\block -> { block | device = device})
        |> validate step "Instance Device" tupleValidations

    InstanceVolumeInput volume -> 
      model 
        |> setBlock (\block -> { block | volume = volume})
        |> validate step "Volume" tupleValidations

    BlockAdd -> 
      let 
        ({errors} as newModel) = model 
                                  |> validate step "Instance Device" tupleValidations 
                                  |> validate step "Volume" tupleValidations 
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


hasNext : Model -> Bool
hasNext model =
  not (List.isEmpty model.next)

hasPrev : Model -> Bool
hasPrev model =
  not (List.isEmpty model.prev)


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

withErrors : Dict String (List Error) -> String ->  Html -> Html
withErrors errors key widget =
  group key widget (defaultEmpty  (Dict.get key errors))

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
stepView address ({aws, machine} as model) =
  case model.step of
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
      Debug.log (toString model.step) [div [] []]


view : Signal.Address Action -> Model -> List Html
view address ({step} as model)=
  panelContents (toString step) (Html.form [] (stepView address model))
