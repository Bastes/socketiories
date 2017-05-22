module Game.Model exposing (Flags, Card(..), Cards, Player, Game, Model)


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
    , playerId : Maybe String
    }
