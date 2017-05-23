module Game.Bid exposing (Bid(..), map)


type Bid
    = None
    | Bid Int
    | Fold


map : (Int -> Int) -> Bid -> Bid
map callback bid =
    case bid of
        None ->
            Bid (max 0 (callback 0))

        Bid b ->
            Bid (max 0 (callback b))

        Fold ->
            Fold
