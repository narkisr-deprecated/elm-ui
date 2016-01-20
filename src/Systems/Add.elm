module Systems.Add where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
import Common.Http exposing (postJson)
import Common.Redirect as Redirect exposing (resultHandler, successHandler)
import Html exposing (..)
import Html.Attributes exposing (class, id, href, placeholder, attribute, type', style)
import Html.Events exposing (onClick)
import Http exposing (Error(BadResponse))
import Task exposing (Task)
import Json.Decode exposing (..)
import Json.Encode as E
import Effects exposing (Effects, batch)
import Dict exposing (Dict)
import Systems.Add.Common exposing (..)
import Systems.Add.AWS as AWS exposing (..)
import Systems.Add.Physical as Physical exposing (..)
import Systems.Add.Openstack as Openstack exposing (..)
import Systems.Add.GCE as GCE exposing (..)
import Systems.Add.Digital as Digital exposing (..)
import Systems.Add.General as General exposing (..)
import Systems.Add.Errors as Errors exposing (..)
import Systems.Add.Encoders exposing (..)
import Systems.Launch as Launch exposing (runJob, JobResponse)
import String exposing (toLower)
import Maybe exposing (withDefault)
import Common.Utils exposing (none)
import Systems.Add.Persistency exposing (persistModel)

type Stage = 
  General 
    | Error
    | Proxmox
    | AWS
    | Openstack
    | GCE
    | Digital
    | Physical

type alias Model = 
  { stage : Stage
  , awsModel : AWS.Model
  , gceModel : GCE.Model
  , physicalModel : Physical.Model
  , digitalModel : Digital.Model
  , openstackModel : Openstack.Model
  , general : General.Model
  , hasNext : Bool
  , saveErrors : Errors.Model
  }

type Action = 
  Next
  | SaveSystem
  | SaveTemplate
  | Create
  | Stage
  | Back
  | NoOp
  | AWSView AWS.Action
  | GCEView GCE.Action
  | PhysicalView Physical.Action
  | DigitalView Digital.Action
  | OpenstackView Openstack.Action
  | GeneralView General.Action
  | ErrorsView Errors.Action
  | Saved Action (Result Http.Error SaveResponse)
  | JobLaunched (Result Http.Error JobResponse)

init : (Model, Effects Action)
init =
  let 
    (aws, _) = AWS.init 
    (openstack, _) = Openstack.init 
    (gce, _) = GCE.init 
    (physical, _) = Physical.init 
    (digital, _) = Digital.init 
    (errors, _) = Errors.init
    (general, effects) = General.init 
  in 
   (Model General aws gce physical digital openstack general True errors, Effects.map GeneralView effects)


setErrors : Model -> Redirect.Errors -> (Model, Effects Action)
setErrors ({saveErrors} as model) es =
  let
    newErrors = {saveErrors | errors = es}  
  in 
    ({model | saveErrors = newErrors}, Effects.none)

setSaved : Action -> Model -> SaveResponse -> (Model, Effects Action)
setSaved next model {id} =
  (model, runJob (toString id) (toLower (toString next)) JobLaunched)

back action hasPrev model =
   let
     newModel = { model |  hasNext = True}
   in
     if hasPrev then
       newModel 
     else 
       {newModel | stage = General}

getBack ({awsModel, gceModel, digitalModel, openstackModel, physicalModel} as model) hyp = 
  let
   backs = Dict.fromList [
      ("aws", (back AWS.Back (AWS.hasPrev awsModel) {model | stage = AWS , awsModel = (AWS.update AWS.Back awsModel)}))
    , ("gce", (back GCE.Back (GCE.hasPrev gceModel) {model | stage = GCE , gceModel = (GCE.update GCE.Back gceModel)}))
    , ("openstack", (back Openstack.Back (Openstack.hasPrev openstackModel) {model | stage = Openstack , openstackModel = (Openstack.update Openstack.Back openstackModel)}))
    , ("digital-ocean", (back Digital.Back (Digital.hasPrev digitalModel) {model | stage = Digital, digitalModel = (Digital.update Digital.Back digitalModel)}))
    , ("physical", (back Physical.Back (Physical.hasPrev physicalModel) {model | stage = Physical, physicalModel = (Physical.update Physical.Back physicalModel)}))
   ]
  in
   withDefault model (Dict.get hyp backs)


update : Action ->  Model-> (Model , Effects Action)
update action ({general, awsModel, gceModel, digitalModel, openstackModel, physicalModel} as model) =
  case action of
    Next -> 
      let 
        current = withDefault Dict.empty (Dict.get general.environment general.rawEnvironments)
      in
        case general.hypervisor of
          "aws" -> 
             let
               newAws = awsModel 
                         |> AWS.update (AWS.Update current) 
                         |> AWS.update AWS.Next
             in
              none { model | stage = AWS , awsModel = newAws, hasNext = AWS.hasNext newAws}

          "gce" -> 
             let
                newGce = gceModel 
                         |> GCE.update (GCE.Update current) 
                         |> GCE.update GCE.Next
             in
               none { model | stage = GCE , gceModel = newGce , hasNext = GCE.hasNext newGce}
 
          "digital-ocean" -> 
            let
               newDigital = digitalModel 
                               |> Digital.update (Digital.Update current) 
                               |> Digital.update Digital.Next
            in
              none { model | stage = Digital , digitalModel = newDigital , hasNext = Digital.hasNext newDigital}

          "physical" -> 
            let
               newPhysical = physicalModel 
                               |> Physical.update (Physical.Update current) 
                               |> Physical.update Physical.Next
            in
              none { model | stage = Physical , physicalModel = newPhysical , hasNext = Physical.hasNext newPhysical}

          "openstack" -> 
            let
               newOpenstack = openstackModel
                               |> Openstack.update (Openstack.Update current) 
                               |> Openstack.update Openstack.Next
            in
              none { model | stage = Openstack , openstackModel = newOpenstack , hasNext = Openstack.hasNext newOpenstack}

          _ -> 
            (model, Effects.none)

    Back -> 
     none (getBack model general.hypervisor)

    AWSView action -> 
      let
        newAws = AWS.update action awsModel 
      in
        none { model | awsModel = newAws }

    GCEView action -> 
      let
        newGce= GCE.update action gceModel
      in
        none { model | gceModel = newGce }

    DigitalView action -> 
      let
        newDigital= Digital.update action digitalModel
      in
        none { model | digitalModel = newDigital }

    PhysicalView action -> 
      let
        newPhysical= Physical.update action physicalModel
      in
        none { model | physicalModel = newPhysical }

    OpenstackView action -> 
      let
        newOpenstack = Openstack.update action openstackModel
      in
        none { model | openstackModel = newOpenstack }

    GeneralView action -> 
      let
        newGeneral= General.update action general
      in
        none { model | general = newGeneral }

    Stage -> 
       persistModel saveSystem model Stage

    SaveSystem -> 
       persistModel saveSystem model NoOp

    SaveTemplate -> 
      none model

    Create -> 
      persistModel saveSystem model Create

    Saved next result -> 
      let
        success = (setSaved next model)
        (({saveErrors} as newModel), effects) = resultHandler result model success (setErrors model) NoOp
      in
         if not (Dict.isEmpty saveErrors.errors.keyValues) then
           ({newModel | stage = Error} , Effects.none)
         else
           (model, effects)

    _ -> (model, Effects.none)

currentView : Signal.Address Action -> Model -> List Html
currentView address ({awsModel, gceModel, digitalModel, physicalModel, openstackModel, saveErrors, general} as model)=
  case model.stage of 
    General -> 
      (General.view (Signal.forwardTo address GeneralView) general)

    AWS -> 
      (AWS.view (Signal.forwardTo address AWSView) awsModel)

    GCE -> 
      (GCE.view (Signal.forwardTo address GCEView) gceModel)

    Digital -> 
      (Digital.view (Signal.forwardTo address DigitalView) digitalModel)

    Physical -> 
      (Physical.view (Signal.forwardTo address PhysicalView) physicalModel)

    Openstack -> 
      (Openstack.view (Signal.forwardTo address OpenstackView) openstackModel)

    Error -> 
      (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)

    _ -> 
      [div [] []]

saveDropdown : Signal.Address Action -> Html 
saveDropdown address =
  ul [class "dropdown-menu"] [
    li [] [a [class "SaveSystem", href "#", onClick address SaveSystem ] [text "Save system"]]
  , li [] [a [class "SaveTemplate", href "#", onClick address SaveTemplate ] [text "Save as template"]]
  , li [] [a [class "Create", href "#", onClick address Create ] [text "Create System"]]
  ]
    
buttons : Signal.Address Action -> Model -> List Html
buttons address ({hasNext} as model) =
  let
    margin = style [("margin-left", "30%")]
    click = onClick address
  in 
    [ 
      button [id "Back", class "btn btn-primary", margin, click Back] [text "<< Back"]
    , if hasNext then
       div [class "btn-group", margin]
           [button [id "Next", class "btn btn-primary", click Next] [text "Next >>"]]
      else
        div [class "btn-group", margin]
         [  button [type' "button", class "btn btn-primary", click Stage] [text "Stage"]
         ,  button [class "btn btn-primary dropdown-toggle"
                   , attribute "data-toggle" "dropdown"
                   , attribute "aria-haspopup" "true"
                   , attribute "aria-expanded" "false"] 
             [ span [class "caret"] [] , span [class "sr-only"] [] ]
          , saveDropdown address
        ]
  ]
       

view : Signal.Address Action -> Model -> List Html
view address model =
 [ row_ [
     div [class "col-md-offset-2 col-md-8"] [
       div [class "panel panel-default"] (currentView address model)
     ]
   ]
 , row_ (buttons address model)
 ]

-- Effects

type alias SaveResponse = 
  { message : String , id : Int } 

saveResponse : Decoder SaveResponse
saveResponse = 
  object2 SaveResponse
    ("message" := string) 
    ("id" := int)

saveSystem : String -> Action -> Effects Action
saveSystem model next = 
  postJson (Http.string model) saveResponse "/systems"  
    |> Task.toResult
    |> Task.map (Saved next)
    |> Effects.task


