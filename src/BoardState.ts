import {CastleRight} from "./FenNumber.ts";
import {Square, SquareName} from "./Square.ts";
import {PlayerColor} from "./Player.ts";
import {CastlingMove, Move} from "./Move.ts";

export class BoardState {

    castleRights: CastleRight[] = []
    enPassantTarget: SquareName|null = null
    halfMoveClock: number = 0
    ply: number = 0
    sideToMove: PlayerColor = 'w'

    update(move: Move): void {

        // increment current ply
        this.ply++
        this.sideToMove = this.ply % 2 === 0 ? 'w' : 'b'

        const shouldResetHalfMoveClock = move.moving.type === 'p' || move.captured
        this.halfMoveClock = shouldResetHalfMoveClock ? 0 : this.halfMoveClock + 1
        // handle the half-move clock

        // handle en-passant target
        if(move.type !== 'double-pawn-move'){
            this.enPassantTarget = null
        }else{
            // @ts-ignore should always be right
            this.enPassantTarget = move.newSquare.file + (move.newSquare.rank === 4 ? '3' : '6')
        }

        // handle castle right revocations
        const currentCastleRights = this.getCastleRightsForColor(move.moving.color)
        if(currentCastleRights.length === 0){
            // if there are no castling rights for moving color, we are done
            return
        }

        if(move.moving.type === 'r'){
            // @ts-ignore for speed
            const type: CastlingMove = CastlingMove.byRookStartSquare[move.moving.startSquare]
            if(currentCastleRights.includes(type.right)){
                this.revokeCastleRights([type.right])
            }
        }else if(move.moving.type === 'k'){
            // king moves
            this.revokeCastleRights(currentCastleRights)
        }
    }

    revokeCastleRights(rights: CastleRight[]): void {
        this.castleRights = this.castleRights.filter((right: CastleRight) => !rights.includes(right))
    }

    getCastleRightsForColor(color: PlayerColor): CastleRight[]
    {
        const typesForColor = color === 'w' ? ['K','Q'] : ['k','q']
        return this.castleRights.filter(value => typesForColor.includes(value));
    }

    clone(): BoardState {
        const state = new BoardState()
        state.castleRights = this.castleRights
        state.enPassantTarget = this.enPassantTarget
        state.halfMoveClock = this.halfMoveClock
        state.ply = this.ply
        state.sideToMove = this.sideToMove
        return state
    }
}