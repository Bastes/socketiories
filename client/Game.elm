port module Game exposing (..)

import Html exposing (programWithFlags)
import Game.View exposing (view)
import Game.Model exposing (Model, Flags)
import Game.Update exposing (Msg, init, update, subscriptions)


main : Program Flags Model Msg
main =
    programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
