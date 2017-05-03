port module Index exposing (..)

import Html exposing (Html, program, div, form, input, text)
import Html.Attributes exposing (id, autocomplete, type_, value)
import Html.Events exposing (onInput, onSubmit)
import WebSocket as WS


main : Program Never Model Msg
main =
    program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { messages : List String
    , currentMessage : String
    }


init : ( Model, Cmd Msg )
init =
    ( { messages = []
      , currentMessage = ""
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = Received String
    | InputChanged String
    | Sending


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Received message ->
            ( { model | messages = message :: model.messages }, Cmd.none )

        InputChanged message ->
            ( { model | currentMessage = message }, Cmd.none )

        Sending ->
            ( { model | currentMessage = "" }, WS.send "ws://localhost:3000" model.currentMessage )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    WS.listen "ws://localhost:3000" Received



-- VIEW


view : Model -> Html Msg
view model =
    div
        [ id "chat" ]
        [ div
            [ id "messages" ]
            (List.map
                (\m -> div [] [ text m ])
                model.messages
            )
        , form
            [ onSubmit Sending ]
            [ input [ type_ "text", value model.currentMessage, onInput InputChanged, autocomplete False ] []
            , input [ type_ "submit", value "Send" ] []
            ]
        ]
