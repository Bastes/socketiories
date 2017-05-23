module Game.View exposing (view)

import Html exposing (Html, div, span, text)
import Html.Attributes exposing (id, class)
import Html.Events exposing (onClick)
import Maybe exposing (andThen, map, map2, withDefault)
import Game.Model exposing (Model, Game, PlayerId, Player, Card(..))
import Game.Update exposing (Msg(..))


view : Model -> Html Msg
view model =
    let
        maybeFirstPlayerId =
            model.game
                |> andThen (.players >> List.head)
                |> map (.id)

        isCurrentPlayer =
            map2 (==) maybeFirstPlayerId model.playerId
                |> withDefault False

        playersViews =
            map (.players >> List.map (playerView isCurrentPlayer)) model.game
                |> withDefault []

        join =
            joinButton model
    in
        div
            [ id "game" ]
            [ div
                [ id "players" ]
                (playersViews ++ join)
            ]


joinButton : Model -> List (Html Msg)
joinButton model =
    let
        playerId =
            model.playerId |> withDefault ""

        players =
            model.game
                |> map .players
                |> withDefault []

        alreadyJoined =
            players |> List.any (.id >> ((==) playerId))
    in
        if alreadyJoined then
            []
        else
            [ span
                [ class "join", onClick Join ]
                [ text "join" ]
            ]


playerView : Bool -> Player -> Html Msg
playerView isCurrentPlayer player =
    div
        [ class "player" ]
        [ span
            [ class "name" ]
            [ text player.name ]
        , div
            [ class "cards" ]
            [ stackView "pile" False player.cards.pile
            , stackView "hand" isCurrentPlayer player.cards.hand
            , stackView "lost" False player.cards.lost
            ]
        , span
            [ class "kick", onClick (Kick player) ]
            [ text "X" ]
        ]


stackView : String -> Bool -> List Card -> Html Msg
stackView name actions cards =
    div [ class ("stack " ++ name) ] <| List.map (cardView actions) cards


cardView : Bool -> Card -> Html Msg
cardView actions card =
    let
        cardClass =
            case card of
                Flower ->
                    "flower"

                Skull ->
                    "skull"

                Hidden ->
                    "hidden"

        actionOnClick =
            case actions of
                True ->
                    [ onClick (Play card) ]

                False ->
                    []
    in
        span (actionOnClick ++ [ class <| "card " ++ cardClass ]) []
