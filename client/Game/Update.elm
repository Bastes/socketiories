module Game.Update exposing (Msg(..), init, update, subscriptions)

import Html
import WebSocket as WS
import Game.Model exposing (Flags, Model, Game, Player)
import Game.Decoder exposing (decodeGame, decodePlayerId)


type Msg
    = GameStatus Game
    | PlayerId String
    | Kick Player
    | Join
    | DecodingError String



-- INIT


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { websocketUrl = flags.websocketUrl
      , game = Nothing
      , playerId = Nothing
      }
    , WS.send flags.websocketUrl "game:join"
    )



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GameStatus game ->
            ( { model | game = Just game }, Cmd.none )

        PlayerId id ->
            ( { model | playerId = Just id }, Cmd.none )

        Kick player ->
            ( model, WS.send model.websocketUrl ("game:kick:" ++ player.id) )

        Join ->
            ( model, WS.send model.websocketUrl ("game:join") )

        DecodingError string ->
            always ( model, Cmd.none ) (Debug.log "decoding error:" string)



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    WS.listen model.websocketUrl (jsonToMsg [ gameStatus, playerId ])



-- UTILS


jsonToMsg : List (String -> Msg) -> String -> Msg
jsonToMsg decoders string =
    List.foldl bestMsgOf (DecodingError "") (List.map ((|>) string) decoders)


bestMsgOf : Msg -> Msg -> Msg
bestMsgOf msg1 msg2 =
    case msg1 of
        DecodingError str1 ->
            case msg2 of
                DecodingError str2 ->
                    DecodingError (str1 ++ "\n" ++ str2)

                _ ->
                    msg2

        _ ->
            msg1


gameStatus : String -> Msg
gameStatus json =
    let
        gameDecoded =
            decodeGame json
    in
        case gameDecoded of
            Ok game ->
                GameStatus game

            Err msg ->
                DecodingError msg


playerId : String -> Msg
playerId json =
    let
        playerIdDecoded =
            decodePlayerId json
    in
        case playerIdDecoded of
            Ok id ->
                PlayerId id

            Err msg ->
                DecodingError msg
