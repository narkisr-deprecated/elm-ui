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
import Focus exposing (Focus, set, (=>), create)

type Stage = 
  General 
    | Error
    | Proxmox
    | AWS
    | Openstack
    | GCE
    | Digital

type alias Model = 
  { stage : Stage
  , awsModel : AWS.Model
  , gceModel : GCE.Model
  , digitalModel : Digital.Model
  , openstackModel : Openstack.Model
  , general : General.Model
  , hasNext : Bool
  , saveErrors : Errors.Model
  }

type Action = 
  Next
  | Save
  | Create
  | Templatize
  | Stage
  | Back
  | NoOp
  | AWSView AWS.Action
  | GCEView GCE.Action
  | DigitalView Digital.Action
  | OpenstackView Openstack.Action
  | GeneralView General.Action
  | ErrorsView Errors.Action
  | SystemSaved Action (Result Http.Error SaveResponse)
  | JobLaunched (Result Http.Error JobResponse)

init : (Model, Effects Action)
init =
  let 
    (aws, _) = AWS.init 
    (openstack, _) = Openstack.init 
    (gce, _) = GCE.init 
    (digital, _) = Digital.init 
    (errors, _) = Errors.init
    (general, effects) = General.init 
  in 
   (Model General aws gce digital openstack general True errors, Effects.map GeneralView effects)


setErrors : Model -> Redirect.Errors -> (Model, Effects Action)
setErrors ({saveErrors} as model) es =
  let
    newErrors = {saveErrors | errors = es}  
  in 
    ({model | saveErrors = newErrors}, Effects.none)

setSaved : Action -> Model -> SaveResponse -> (Model, Effects Action)
setSaved next model {id} =
  (model, runJob (toString id) (toLower (toString next)) JobLaunched)

encoder stage model =
 let 
   key = (String.toLower (toString stage))
   encoders = Dict.fromList [
       ("aws" , (\ ({awsModel}) -> awsEncoder awsModel))
     , ("gce" , (\ ({gceModel}) -> gceEncoder gceModel))
   ]
 in
  case (Dict.get key encoders) of
    Just  enc -> 
       (key, (enc model))
    Nothing -> 
       (key, E.null)
   

encodeAwsModel : Model -> E.Value
encodeAwsModel ({awsModel, general} as model) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , (encoder AWS model)
  , ("machine" , machineEncoder awsModel.machine)
 ]

encodeGceModel : Model -> E.Value
encodeGceModel ({gceModel, general} as model) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , (encoder GCE model)
  , ("machine" , machineEncoder gceModel.machine)
 ]

encodeDigitalModel : Model -> E.Value
encodeDigitalModel ({digitalModel, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("digital-ocean" , digitalEncoder digitalModel)
  , ("machine" , machineEncoder digitalModel.machine)
 ]

encodeOpenstackModel : Model -> E.Value
encodeOpenstackModel ({openstackModel, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("openstack" , openstackEncoder openstackModel)
  , ("machine" , machineEncoder openstackModel.machine)
 ]

blockDevices : Focus { r | blockDevices :a } a
blockDevices =
   create .blockDevices (\f r -> { r | blockDevices = f r.blockDevices })

volumes : Focus { r | volumes :a } a
volumes =
   create .volumes (\f r -> { r | volumes = f r.volumes })

aws : Focus { r | aws :a } a
aws =
   create .aws (\f r -> { r | aws = f r.aws })

awsModel : Focus { r | awsModel :a } a
awsModel =
   create .awsModel (\f r -> { r | awsModel = f r.awsModel })

openstack : Focus { r | openstack :a } a
openstack =
   create .openstack (\f r -> { r | openstack= f r.openstack })

openstackModel : Focus { r | openstackModel :a } a
openstackModel =
   create .openstackModel (\f r -> { r | openstackModel = f r.openstackModel })


addDevice : Maybe (List {r | device : String}) -> Maybe (List {r | device : String})
addDevice vs = 
  Just (List.map (\({device} as volume) -> {volume | device = "/dev/"++device}) (withDefault [] vs))

transformers =  Dict.fromList [
    ("AWS", ((Focus.update (awsModel => aws => blockDevices) addDevice) <<
             (Focus.update (awsModel => aws => volumes) addDevice)))
  , ("Openstack", Focus.update (openstackModel => openstack => volumes) addDevice)
  ]

encoders =  Dict.fromList [
    ("AWS", encodeAwsModel)
  , ("GCE", encodeGceModel)
  , ("Digital", encodeDigitalModel)
  , ("Openstack", encodeOpenstackModel)
  ]

encodeModel : Model -> Action -> (Model , Effects Action)
encodeModel ({stage} as model) action =
  case (Dict.get (toString stage) encoders) of
     Just encode -> 
        case (Dict.get (toString stage) transformers) of
          Just transform -> 
            (model, saveSystem (E.encode 0 (encode (transform model))) action)

          Nothing -> 
            (model, saveSystem (E.encode 0 (encode model)) action)

     Nothing -> 
       none model

back action hasPrev model =
   let
     newModel = { model |  hasNext = True}
   in
     if hasPrev then
       newModel 
     else 
       {newModel | stage = General}

getBack ({awsModel, gceModel, digitalModel, openstackModel} as model) hyp = 
  let
   backs = Dict.fromList [
      ("aws", (back AWS.Back (AWS.hasPrev awsModel) {model | stage = AWS , awsModel = (AWS.update AWS.Back awsModel)}))
    , ("gce", (back GCE.Back (GCE.hasPrev gceModel) {model | stage = GCE , gceModel = (GCE.update GCE.Back gceModel)}))
    , ("openstack", (back Openstack.Back (Openstack.hasPrev openstackModel) {model | stage = Openstack , openstackModel = (Openstack.update Openstack.Back openstackModel)}))
    , ("digital-ocean", (back Digital.Back (Digital.hasPrev digitalModel) {model | stage = Digital, digitalModel = (Digital.update Digital.Back digitalModel)}))
   ]
  in
   withDefault model (Dict.get hyp backs)


update : Action ->  Model-> (Model , Effects Action)
update action ({general, awsModel, gceModel, digitalModel, openstackModel} as model) =
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
     none  (getBack model general.hypervisor)

    AWSView action -> 
      let
        newAws = AWS.update action awsModel 
      in
        ({ model | awsModel = newAws }, Effects.none)

    GCEView action -> 
      let
        newGce= GCE.update action gceModel
      in
        ({ model | gceModel = newGce }, Effects.none)

    DigitalView action -> 
      let
        newDigital= Digital.update action digitalModel
      in
        ({ model | digitalModel = newDigital }, Effects.none)

    OpenstackView action -> 
      let
        newOpenstack = Openstack.update action openstackModel
      in
        ({ model | openstackModel = newOpenstack }, Effects.none)

    GeneralView action -> 
      let
        newGeneral= General.update action general
      in
        ({ model | general = newGeneral }, Effects.none)

    Stage -> 
       encodeModel model Stage

    Save -> 
       encodeModel model NoOp

    Create -> 
      encodeModel model Create

    SystemSaved next result -> 
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
currentView address ({awsModel, gceModel, digitalModel, openstackModel, saveErrors, general} as model)=
  case model.stage of 
    General -> 
      (General.view (Signal.forwardTo address GeneralView) general)

    AWS -> 
      (AWS.view (Signal.forwardTo address AWSView) awsModel)

    GCE -> 
      (GCE.view (Signal.forwardTo address GCEView) gceModel)

    Digital -> 
      (Digital.view (Signal.forwardTo address DigitalView) digitalModel)

    Openstack -> 
      (Openstack.view (Signal.forwardTo address OpenstackView) openstackModel)

    Error -> 
      (Errors.view (Signal.forwardTo address ErrorsView) saveErrors)

    _ -> 
      [div [] []]

saveDropdown : Signal.Address Action -> Html 
saveDropdown address =
  ul [class "dropdown-menu"] [
    li [] [a [class "SaveOnly", href "#", onClick address Save ] [text "Save only"]]
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
    |> Task.map (SystemSaved next)
    |> Effects.task


