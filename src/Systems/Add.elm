module Systems.Add where

import Bootstrap.Html exposing (..)
import Html.Shorthand exposing (..)
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
import Systems.Add.GCE as GCE exposing (..)
import Systems.Add.Digital as Digital exposing (..)
import Systems.Add.General as General exposing (..)
import Systems.Add.Errors as Errors exposing (..)
import Systems.Add.Encoders exposing (..)
import Systems.Launch as Launch exposing (runJob, JobResponse)
import String exposing (toLower)
import Maybe exposing (withDefault)
import Common.Utils exposing (none)

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
  , aws : AWS.Model
  , gce : GCE.Model
  , digital: Digital.Model
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
  | GeneralView General.Action
  | ErrorsView Errors.Action
  | SystemSaved Action (Result Http.Error SaveResponse)
  | JobLaunched (Result Http.Error JobResponse)

init : (Model, Effects Action)
init =
  let 
    (aws, _) = AWS.init 
    (gce, _) = GCE.init 
    (digital, _) = Digital.init 
    (errors, _) = Errors.init
    (general, effects) = General.init 
  in 
   (Model General aws gce digital general True errors, Effects.map GeneralView effects)


setErrors : Model -> Redirect.Errors -> (Model, Effects Action)
setErrors ({saveErrors} as model) es =
  let
    newErrors = {saveErrors | errors = es}  
  in 
    ({model | saveErrors = newErrors}, Effects.none)

setSaved : Action -> Model -> SaveResponse -> (Model, Effects Action)
setSaved next model {id} =
  (model, runJob (toString id) (toLower (toString next)) JobLaunched)

encodeAwsModel : Model -> E.Value
encodeAwsModel ({aws, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("aws" , awsEncoder aws)
  , ("machine" , machineEncoder aws.machine)
 ]

encodeGceModel : Model -> E.Value
encodeGceModel ({gce, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("gce" , gceEncoder gce)
  , ("machine" , machineEncoder gce.machine)
 ]

encodeDigitalModel : Model -> E.Value
encodeDigitalModel ({digital, general}) =
 E.object [
    ("type" , E.string general.type')
  , ("owner" , E.string general.owner)
  , ("env" , E.string general.environment)
  , ("digital-ocean" , digitalEncoder digital)
  , ("machine" , machineEncoder digital.machine)
 ]


encodeModel : Model -> Action -> (Model , Effects Action)
encodeModel ({stage} as model) action =
  case stage of
    AWS -> 
      (model, saveSystem (E.encode 0 (encodeAwsModel model)) action)

    GCE -> 
      (model, saveSystem (E.encode 0 (encodeGceModel model)) action)

    Digital -> 
      (model, saveSystem (E.encode 0 (encodeDigitalModel model)) action)

    _ -> 
      (model, Effects.none)

update : Action ->  Model-> (Model , Effects Action)
update action ({general, aws, gce, digital} as model) =
  case action of
    Next -> 
      let 
        current = withDefault Dict.empty (Dict.get general.environment general.rawEnvironments)
      in
        case general.hypervisor of
          "aws" -> 
             let
               newAws = aws 
                         |> AWS.update (AWS.Update current) 
                         |> AWS.update AWS.Next
             in
              none { model | stage = AWS , aws = newAws, hasNext = AWS.hasNext newAws}

          "gce" -> 
             let
                newGce = gce 
                         |> GCE.update (GCE.Update current) 
                         |> GCE.update GCE.Next
             in
               none { model | stage = GCE , gce = newGce , hasNext = GCE.hasNext newGce}
 
          "digital-ocean" -> 
            let
               newDigital = digital 
                               |> Digital.update (Digital.Update current) 
                               |> Digital.update Digital.Next
            in
              none { model | stage = Digital , digital = newDigital , hasNext = Digital.hasNext newDigital}

          _ -> 
            (model, Effects.none)

    Back -> 
      case general.hypervisor of
        "aws" -> 
           let
             newAws = AWS.update AWS.Back aws
           in
             if AWS.hasPrev aws then
              ({ model | stage = AWS , aws = newAws, hasNext = True}, Effects.none)
             else 
              ({ model | stage = General , aws = newAws , hasNext = True}, Effects.none)

        "gce" -> 
           let
             newGCE = GCE.update GCE.Back gce
           in
             if GCE.hasPrev gce then
              ({ model | stage = GCE , gce = newGCE, hasNext = True}, Effects.none)
             else 
              ({ model | stage = General , gce = newGCE  , hasNext = True}, Effects.none)

        "digital-ocean" -> 
           let
             newDigital= Digital.update Digital.Back digital
           in
             if Digital.hasPrev digital then
              ({ model | stage = Digital , digital = newDigital, hasNext = True}, Effects.none)
             else 
              ({ model | stage = General , digital = newDigital  , hasNext = True}, Effects.none)

        _ -> 
          (model, Effects.none)

    AWSView action -> 
      let
        newAws = AWS.update action aws 
      in
        ({ model | aws = newAws }, Effects.none)

    GCEView action -> 
      let
        newGce= GCE.update action gce
      in
        ({ model | gce = newGce }, Effects.none)

    DigitalView action -> 
      let
        newDigital= Digital.update action digital
      in
        ({ model | digital = newDigital }, Effects.none)

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
currentView address model  =
  case model.stage of 
    General -> 
      (General.view (Signal.forwardTo address GeneralView) model.general)

    AWS -> 
      (AWS.view (Signal.forwardTo address AWSView) model.aws)

    GCE -> 
      (GCE.view (Signal.forwardTo address GCEView) model.gce)

    Digital -> 
      (Digital.view (Signal.forwardTo address DigitalView) model.digital)

    Error -> 
      (Errors.view (Signal.forwardTo address ErrorsView) model.saveErrors)

    _ -> 
      [div [] []]

saveDropdown : Signal.Address Action -> Html 
saveDropdown address =
  ul [class "dropdown-menu"] [
    li [] [a [href "#", onClick address Save ] [text "Save only"]]
  , li [] [a [href "#", onClick address Create ] [text "Create System"]]
  ]
    
buttons : Signal.Address Action -> Model -> List Html
buttons address ({hasNext} as model) =
  let
    margin = style [("margin-left", "30%")]
    click = onClick address
  in 
    [ 
      button [class "btn btn-primary", margin, click Back] [text "<< Back"]
    , if hasNext then
       div [class "btn-group", margin]
           [button [class "btn btn-primary", click Next] [text "Next >>"]]
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
  postJson saveResponse "/systems" (Http.string model) 
    |> Task.toResult
    |> Task.map (SystemSaved next)
    |> Effects.task


postJson : Decoder value -> String -> Http.Body -> Task Http.Error value
postJson decoder url body =
  let request =
        { verb = "POST"
        , headers = [
             ("Content-Type", "application/json;charset=UTF-8")
           , ("Accept", "application/json, text/plain, */*")
         ]
        , url = url
        , body = body
        }
  in
    Http.fromJson decoder (Http.send Http.defaultSettings request)
