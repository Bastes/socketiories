module Game.Update exposing (Msg(..), init, update, subscriptions)

import Html
import WebSocket as WS
import Game.Bid exposing (Bid(..), map)
import Game.Model exposing (Flags, Model, Game, PlayerId, Player, Card, cardLetter)
import Game.Decoder exposing (decodeGame, decodePlayerId)


type Msg
    = GameStatus Game
    | CurrentPlayerId PlayerId
    | DecodingError String
    | Kick Player
    | Join
    | Play Card
    | LowerBid
    | RaiseBid
    | PlaceBid Int



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
    let
        maybePlayer =
            model.game
                |> Maybe.andThen (Just << .players)
    in
        case msg of
            GameStatus game ->
                ( { model | game = Just game }, Cmd.none )

            CurrentPlayerId id ->
                ( { model | playerId = Just id }, Cmd.none )

            DecodingError string ->
                always ( model, Cmd.none ) (Debug.log "decoding error:" string)

            Kick player ->
                ( model, WS.send model.websocketUrl ("game:kick:" ++ player.id) )

            Join ->
                ( model, WS.send model.websocketUrl ("game:join") )

            Play card ->
                ( model, WS.send model.websocketUrl ("game:play:" ++ (cardLetter card)) )

            LowerBid ->
                ( { model | game = model |> changeBid (map (\i -> i - 1)) }, Cmd.none )

            RaiseBid ->
                ( { model | game = model |> changeBid (map (\i -> i + 1)) }, Cmd.none )

            PlaceBid bid ->
                ( model, WS.send model.websocketUrl ("game:bid:" ++ (toString bid)) )


changeBid : (Bid -> Bid) -> Model -> Maybe Game
changeBid change model =
    let
        updateBid : (Bid -> Bid) -> Player -> Player
        updateBid update player =
            { player | bid = update player.bid }

        updatePlayer : (Player -> Bool) -> (Player -> Player) -> Player -> Player
        updatePlayer condition update player =
            if (condition player) then
                update player
            else
                player

        updateOnePlayer : (PlayerId -> Player -> Bool) -> (Player -> Player) -> PlayerId -> Game -> Game
        updateOnePlayer condition update playerId game =
            { game
                | players =
                    game.players
                        |> List.map (updatePlayer (condition playerId) update)
            }
    in
        Maybe.map2
            (updateOnePlayer (flip (.id >> (==))) (updateBid change))
            model.playerId
            model.game



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
                CurrentPlayerId id

            Err msg ->
                DecodingError msg
