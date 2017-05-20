module Game.Decoder exposing (decodeGame)

import Json.Decode exposing (..)
import Game.Model exposing (Card(..), Cards, Player, Game)


card : Char -> Result String Card
card char =
    case char of
        'F' ->
            Ok Flower

        'S' ->
            Ok Skull

        'H' ->
            Ok Hidden

        c ->
            Err <| "'" ++ (String.fromList [ c ]) ++ "' cannot be cast into a Card"


isOk : Result a b -> Bool
isOk result =
    case result of
        Ok _ ->
            True

        Err _ ->
            False


fromOk : Result a b -> Maybe b
fromOk result =
    case result of
        Ok b ->
            Just b

        _ ->
            Nothing


fromErr : Result a b -> Maybe a
fromErr result =
    case result of
        Err a ->
            Just a

        _ ->
            Nothing


cardList : String -> Decoder (List Card)
cardList string =
    let
        decoded =
            string |> String.toList |> List.map card
    in
        if decoded |> List.all isOk then
            decoded |> List.filterMap fromOk |> succeed
        else
            decoded |> List.filterMap fromErr |> String.join "\n" |> fail


cardListDecoder : Decoder (List Card)
cardListDecoder =
    string |> andThen cardList


playerDecoder : Decoder Player
playerDecoder =
    let
        cards =
            map3
                Cards
                (field "hand" cardListDecoder)
                (field "pile" cardListDecoder)
                (field "lost" cardListDecoder)
    in
        map4
            Player
            (field "id" string)
            (field "name" string)
            (field "bets" int)
            (field "cards" cards)


gameDecoder : Decoder Game
gameDecoder =
    map Game (field "players" (list playerDecoder))


decodeGame : String -> Result String Game
decodeGame =
    decodeString gameDecoder
