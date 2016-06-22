module Systems.Add exposing (..)

import Bootstrap.Html exposing (..)

import Common.Http exposing (postJson, SaveResponse, saveResponse)
import Common.Errors as Errors exposing (errorsSuccessHandler)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Http exposing (Error(BadResponse))
import Task exposing (Task)
import Json.Decode exposing (..)
import Json.Encode as E
import Platform.Cmd exposing (batch)
import Dict exposing (Dict)
import Systems.Add.Common exposing (..)
import Systems.Add.AWS as AWS exposing (..)
import Systems.Add.Physical as Physical exposing (..)
import Systems.Add.Openstack as Openstack exposing (..)
import Systems.Add.KVM as KVM exposing (..)
import Systems.Add.GCE as GCE exposing (..)
import Systems.Add.Digital as Digital exposing (..)
import Systems.Add.General as General exposing (..)
import Systems.Add.Encoders exposing (..)
import Jobs.Common as Jobs exposing (runJob, JobResponse)
import String exposing (toLower)
import Maybe exposing (withDefault)
import Common.Utils exposing (none)
import Systems.Add.Persistency exposing (persistModel)
import Systems.Model.Common exposing (System, Machine, emptyMachine)
import Common.Wizard as Wizard
import Common.Components exposing (asList, panelContents, panel, dialogPanel, error, notImplemented, buttons)

type Stage = 
  General 
    | Error
    | Proxmox
    | AWS
    | Openstack
    | KVM
    | GCE
    | Digital
    | Physical

type alias Model = 
  { 
    awsModel : AWS.Model
  , gceModel : GCE.Model
  , physicalModel : Physical.Model
  , digitalModel : Digital.Model
  , openstackModel : Openstack.Model
  , general : General.Model
  , kvmModel : KVM.Model
  , hasNext : Bool
  , saveErrors : Errors.Model
  , stage : Stage
  }

type Msg = 
  Next
  | SaveSystem
  | SaveTemplate
  | Create
  | Stage
  | Back
  | NoOp
  | AWSView AWS.Msg
  | GCEView GCE.Msg
  | PhysicalView Physical.Msg
  | DigitalView Digital.Msg
  | OpenstackView Openstack.Msg
  | KVMView KVM.Msg
  | GeneralView General.Msg
  | ErrorsView Errors.Msg
  | Saved Msg (Result Http.Error SaveResponse)
  | JobLaunched (Result Http.Error JobResponse)

init : (Model, Effects Msg)
init =
  let 
    (general, effects) = General.init 
    withModels = Model AWS.init GCE.init Physical.init Digital.init Openstack.init general KVM.init 
  in 
    (withModels True Errors.init General, Effects.map GeneralView effects)


setSaved : Msg -> Model -> SaveResponse -> (Model, Effects Msg)
setSaved next model {id} =
  case id of 
    Just num -> 
      (model, runJob (toString num) (toLower (toString next)) JobLaunched)

    Nothing -> 
      none model


back hasPrev model =
   let
     newModel = { model |  hasNext = True}
   in
     if hasPrev then
       newModel 
     else 
       {newModel | stage = General}

getBack ({awsModel, gceModel, digitalModel, openstackModel, physicalModel, kvmModel} as model) hyp = 
  let
   backs = Dict.fromList [
      ("aws", (back (Wizard.hasPrev awsModel) {model | stage = AWS , awsModel = (AWS.back awsModel)}))
    , ("gce", (back (Wizard.hasPrev gceModel) {model | stage = GCE , gceModel = (GCE.back gceModel)}))
    , ("kvm", (back (Wizard.hasPrev kvmModel) {model | stage = KVM , kvmModel = (KVM.back kvmModel)}))
    , ("openstack", (back (Wizard.hasPrev openstackModel) {model | stage = Openstack , openstackModel = (Openstack.back openstackModel)}))
    , ("digital-ocean", (back (Wizard.hasPrev digitalModel) {model | stage = Digital, digitalModel = Digital.back digitalModel}))
    , ("physical", (back (Wizard.hasPrev physicalModel) {model | stage = Physical, physicalModel = (Physical.back physicalModel)}))
   ]
  in
   withDefault model (Dict.get hyp backs)

machineFrom : String -> Model -> Machine
machineFrom stage {awsModel, gceModel, digitalModel, openstackModel, physicalModel, kvmModel} =
  let 
    machines =  Dict.fromList [
            ("aws", awsModel.machine)
          , ("gce", gceModel.machine)
          , ("openstack", openstackModel.machine)
          , ("digital", digitalModel.machine)
          , ("kvm", kvmModel.machine)
          , ("physical", physicalModel.machine)
      ]
  in
    withDefault emptyMachine (Dict.get (String.toLower stage) machines)

  
intoSystem : Model -> System
intoSystem ({general, awsModel, gceModel, digitalModel, openstackModel, kvmModel, physicalModel, stage} as model) = 
  let
    {admin, type'} =  general
    baseSystem = System admin.owner admin.environment type' (machineFrom (toString stage) model)
  in 
    baseSystem (Just awsModel.aws) (Just gceModel.gce) (Just digitalModel.digital) (Just openstackModel.openstack) (Just physicalModel.physical) (Just kvmModel.kvm)
  
update : Msg ->  Model -> (Model , Cmd Msg)
update msg ({general, awsModel, gceModel, digitalModel, openstackModel, physicalModel, kvmModel, stage} as model) =
  case msg of
    Next -> 
      let 
        {admin} = general
        current = withDefault Dict.empty (Dict.get admin.environment admin.rawEnvironments)
      in
        case general.hypervisor of
          "aws" -> 
            let
              newAws = AWS.next awsModel current 
            in
              none { model | stage = AWS, awsModel = newAws , hasNext = Wizard.hasNext newAws}

          "gce" -> 
             let
               newGce = GCE.next gceModel current 
             in
               none { model | stage = GCE, gceModel = newGce , hasNext = Wizard.hasNext newGce}

          "digital-ocean" -> 
            let
               newDigital = Digital.next digitalModel current 
            in
              none { model | stage = Digital , digitalModel = newDigital , hasNext = Wizard.hasNext newDigital}

          "physical" -> 
            let
              newPhysical = Physical.next physicalModel current 
            in
              none { model | stage = Physical , physicalModel = newPhysical , hasNext = Wizard.hasNext newPhysical}

          "openstack" -> 
            let
              newOpenstack = Openstack.next openstackModel current 
            in
              none { model | stage = Openstack , openstackModel = newOpenstack , hasNext = Wizard.hasNext newOpenstack}

          "kvm" -> 
            let
              newKvm = KVM.next kvmModel current 
            in
              none { model | stage = KVM , kvmModel = newKvm , hasNext = Wizard.hasNext newKvm}


          _ -> 
            (model, Effects.none)

    Back -> 
     none (getBack model general.hypervisor)

    AWSView msg -> 
      let
        newAws = AWS.update msg awsModel 
      in
        none { model | awsModel = newAws }

    GCEView msg -> 
      let
        newGce= GCE.update msg gceModel
      in
        none { model | gceModel = newGce }

    DigitalView msg -> 
      let
        newDigital= Digital.update msg digitalModel
      in
        none { model | digitalModel = newDigital }

    PhysicalView msg -> 
      let
        newPhysical= Physical.update msg physicalModel
      in
        none { model | physicalModel = newPhysical }

    OpenstackView msg -> 
      let
        newOpenstack = Openstack.update msg openstackModel
      in
        none { model | openstackModel = newOpenstack }

    KVMView msg -> 
      let
        newKvm = KVM.update msg kvmModel
      in
        none { model | kvmModel = newKvm }

    GeneralView msg -> 
      let
        (newGeneral, effects) = General.update msg general
      in
        ({ model | general = newGeneral }, Effects.map GeneralView effects)

    Stage -> 
       (model, persistModel (saveSystem Stage) (intoSystem model) (toString stage))

    SaveSystem -> 
       (model, persistModel (saveSystem NoOp) (intoSystem model) (toString stage))

    Create -> 
      (model, persistModel (saveSystem Create) (intoSystem model) (toString stage))

    SaveTemplate -> 
      none model

    Saved next result -> 
      let
        ({saveErrors} as newModel, effects) = errorsSuccessHandler result model (setSaved next model) NoOp
      in
       if Errors.hasErrors saveErrors then
          ({newModel | stage = Error} , effects)
       else
          (model, effects)

    _ -> 
     none model

currentView : Model -> Html
currentView ({awsModel, gceModel, digitalModel, physicalModel, openstackModel, kvmModel, saveErrors, general} as model)=
  case model.stage of 
    General -> 
      (General.view (Signal.forwardTo GeneralView) general)

    AWS -> 
      (AWS.view (Signal.forwardTo AWSView) awsModel)

    GCE -> 
      (GCE.view (Signal.forwardTo GCEView) gceModel)

    Digital -> 
      (Digital.view (Signal.forwardTo DigitalView) digitalModel)

    Physical -> 
      (Physical.view (Signal.forwardTo PhysicalView) physicalModel)

    Openstack -> 
      (Openstack.view (Signal.forwardTo OpenstackView) openstackModel)

    KVM -> 
      (KVM.view (Signal.forwardTo KVMView) kvmModel)

    _ -> 
      notImplemented

saveMenu : Html 
saveMenu =
  ul [class "dropdown-menu"] [
    li [] [a [class "SaveSystem", href "#", onClick SaveSystem ] [text "Save system"]]
  , li [] [a [class "SaveTemplate", href "#", onClick SaveTemplate ] [text "Save as template"]]
  , li [] [a [class "Create", href "#", onClick Create ] [text "Create System"]]
  ]
    
dropdown = 
  [  button [type' "button", class "btn btn-primary", onClick Stage] [text "Stage"]
  ,  button [class "btn btn-primary dropdown-toggle"
          , attribute "data-toggle" "dropdown"
          , attribute "aria-haspopup" "true"
          , attribute "aria-expanded" "false"] 
    [ span [class "caret"] [] , span [class "sr-only"] [] ]
  , saveMenu address
  ]

errorsView {saveErrors} = 
   let
     body = (Errors.view (Signal.forwardTo ErrorsView) saveErrors)
   in
     dialogPanel "danger" (error "Failed to save system") (panel (panelContents body))


view : Model -> List (Html Msg)
view ({stage} as model) =
 [ row_ [
     (if stage /= Error then
        div [class "col-md-offset-2 col-md-8"] [
          (panel (currentView model))
        ]
       else
         div [] (errorsView model))
   ]
 , row_ (buttons model Next Back (dropdown address))
 ]

-- Effects

saveSystem : Msg -> String -> Effects Msg
saveSystem next json  = 
  postJson (Http.string json) saveResponse "/systems"  
    |> Task.toResult
    |> Task.map (Saved next)
    |> Effects.task


