import {CastleRight} from "./FenNumber.ts";
import {Square, SquareName} from "./Square.ts";
import {PlayerColor} from "./Player.ts";
import { Move } from "./Move.ts";

export class BoardState {

    castleRights: CastleRight[] = []
    enPassantTarget: SquareName|null = null
    halfMoveClock: number = 0
    ply: number = 0

    update(move: Move): void {

        // increment current ply
        this.ply++;

        // handle the half-move clock
        if(move.moving.type === 'p' || move.captured){
            this.halfMoveClock = 0
        }else{
            this.halfMoveClock++
        }

        // handle en-passant target
        if(move.type !== 'double-pawn-move'){
            this.enPassantTarget = null
        }else{
            this.enPassantTarget = Square.sanitizeName(move.newSquare.file + (move.newSquare.rank === 4 ? '3' : '6'))
        }

        // handle castle right revocations
        const currentCastleRights = this.getCastleRightsForColor(move.moving.color)
        if(currentCastleRights.length === 0){
            // if there are no castling rights for moving color, we are done
            return
        }

        if(move.moving.type === 'r'){
            // rook moves
            const type = Move.castleTypeByRookStartSquare(move.moving.startSquare)
            if(currentCastleRights.includes(type)){
                this.revokeCastleRights([type])
            }
        }else if(move.moving.type === 'k'){
            // king moves
            this.revokeCastleRights(currentCastleRights)
        }
    }

    get sideToMove(): PlayerColor
    {
        return this.ply % 2 === 0 ? 'w' : 'b'
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
        return state
    }
}