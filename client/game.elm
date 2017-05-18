port module Game exposing (..)

import Html exposing (Html, programWithFlags, div, span, text)
import Html.Attributes exposing (id, class)
import Html.Events exposing (onClick)
import WebSocket as WS
import Json.Decode as D


main : Program Flags Model Msg
main =
    programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Flags =
    { websocketUrl : String
    }


type alias Player =
    { id : String
    , name : String
    }


type alias Game =
    { players : List Player
    }


type alias Model =
    { websocketUrl : String
    , game : Maybe Game
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { websocketUrl = flags.websocketUrl
      , game = Nothing
      }
    , WS.send flags.websocketUrl "game:join"
    )



-- UPDATE


type Msg
    = GameStatus (Maybe Game)
    | Kick Player
    | Join


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GameStatus game ->
            ( { model | game = game }, Cmd.none )

        Kick player ->
            ( model, WS.send model.websocketUrl ("game:kick:" ++ player.id) )

        Join ->
            ( model, WS.send model.websocketUrl ("game:join") )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    WS.listen model.websocketUrl gameStatus


playerDecoder =
    D.map2 Player (D.field "id" D.string) (D.field "name" D.string)


gameDecoder =
    D.map Game (D.field "players" (D.list playerDecoder))


decodeGame =
    D.decodeString gameDecoder


gameStatus : String -> Msg
gameStatus json =
    let
        gameDecoded =
            decodeGame json
    in
        case gameDecoded of
            Ok game ->
                GameStatus (Just game)

            Err msg ->
                GameStatus Nothing



-- VIEW


view : Model -> Html Msg
view model =
    let
        players =
            case model.game of
                Just game ->
                    List.map playerView game.players

                Nothing ->
                    []

        join =
            case model.game of
                Just game ->
                    [ span
                        [ class "join", onClick Join ]
                        [ text "join" ]
                    ]

                Nothing ->
                    []
    in
        div
            [ id "game" ]
            [ div
                [ id "players" ]
                (players ++ join)
            ]


playerView : Player -> Html Msg
playerView player =
    div
        [ class "player" ]
        [ span
            [ class "name" ]
            [ text player.name ]
        , span
            [ class "kick", onClick (Kick player) ]
            [ text "X" ]
        ]
