module Game.View exposing (view)

import Html exposing (Html, div, span, text)
import Html.Attributes exposing (id, class)
import Html.Events exposing (onClick)
import Game.Model exposing (Model, Game, Player, Card(..))
import Game.Update exposing (Msg(..))


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

                Hidden ->
                    "hidden"
    in
        span [ class <| "card " ++ cardClass ] []
