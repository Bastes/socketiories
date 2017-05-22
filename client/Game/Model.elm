module Game.Model exposing (Flags, Card(..), Cards, PlayerId, Player, Game, Model, cardLetter)


type alias Flags =
    { websocketUrl : String
    }


type Card
    = Flower
    | Skull
    | Hidden


type alias Cards =
    { hand : List Card
    , pile : List Card
    , lost : List Card
    }


type alias PlayerId =
    String


type alias Player =
    { id : PlayerId
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
    , playerId : Maybe PlayerId
    }


cardLetter : Card -> String
cardLetter card =
    case card of
        Flower ->
            "F"

        Skull ->
            "S"

        Hidden ->
            "?"
