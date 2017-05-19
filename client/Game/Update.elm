module Game.Update exposing (Msg(..), init, update, subscriptions)

import Html
import WebSocket as WS
import Game.Model exposing (Flags, Model, Game, Player)
import Game.Decoder exposing (decodeGame)


type Msg
    = GameStatus (Maybe Game)
    | Kick Player
    | Join



-- INIT


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { websocketUrl = flags.websocketUrl
      , game = Nothing
      }
    , WS.send flags.websocketUrl "game:join"
    )



-- UPDATE


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



-- UTILS


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
