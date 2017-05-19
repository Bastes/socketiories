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


type Card
    = Flower
    | Skull


type alias Cards =
    { hand : List Card
    , pile : List Card
    , lost : List Card
    }


type alias Player =
    { id : String
    , name : String
    , bets : Int
    , cards : Cards
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
    let
        card char =
            case char of
                'F' ->
                    Ok Flower

                'S' ->
                    Ok Skull

                c ->
                    Err <| "'" ++ (String.fromList [ c ]) ++ "' cannot be cast into a Card"

        cardList string =
            let
                decoded =
                    string |> String.toList |> List.map card

                isOk result =
                    case result of
                        Ok _ ->
                            True

                        Err _ ->
                            False

                allGood =
                    decoded |> List.all isOk

                okList result =
                    case result of
                        (Ok card) :: rest ->
                            card :: (okList rest)

                        [] ->
                            []

                        _ :: rest ->
                            okList rest

                errList result =
                    case result of
                        (Err err) :: rest ->
                            err :: (errList rest)

                        [] ->
                            []

                        _ :: rest ->
                            errList rest
            in
                if allGood then
                    okList decoded |> D.succeed
                else
                    errList decoded |> String.join "\n" |> D.fail

        cards =
            D.map3
                Cards
                (D.field "hand" D.string |> D.andThen cardList)
                (D.field "pile" D.string |> D.andThen cardList)
                (D.field "lost" D.string |> D.andThen cardList)
    in
        D.map4
            Player
            (D.field "id" D.string)
            (D.field "name" D.string)
            (D.field "bets" D.int)
            (D.field "cards" cards)


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
        , div
            [ class "cards" ]
            [ stackView "pile" player.cards.pile
            , stackView "hand" player.cards.hand
            , stackView "lost" player.cards.lost
            ]
        , span
            [ class "kick", onClick (Kick player) ]
            [ text "X" ]
        ]


stackView : String -> List Card -> Html Msg
stackView name cards =
    div [ class ("stack " ++ name) ] <| List.map cardView cards


cardView : Card -> Html Msg
cardView card =
    let
        cardClass =
            case card of
                Flower ->
                    "flower"

                Skull ->
                    "skull"
    in
        span [ class <| "card " ++ cardClass ] []
