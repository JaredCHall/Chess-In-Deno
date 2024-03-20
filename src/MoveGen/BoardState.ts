import {CastleRight} from "../FenNumber.ts";
import {Square, SquareName} from "./Square.ts";
import {PlayerColor} from "../Player.ts";
import {CastlingMove, Move} from "./Move.ts";

export class BoardState {

    castleRights: Record<CastleRight,boolean> = {K:false, Q: false, k: false, q: false}
    enPassantTarget: SquareName|null = null
    halfMoveClock: number = 0
    ply: number = 0
    sideToMove: PlayerColor = 'w'

    update(move: Move): void {
        this.ply++
        this.sideToMove = this.ply % 2 === 0 ? 'w' : 'b'
        switch(move.moving.type){
            case 'p':                       return this.#updatePawnMove(move)
            case 'b': case 'n': case 'q':   return this.#updatePieceMove(move);
            case 'r':                       return this.#updateRookMove(move);
        }
        this.#updateKingMove(move)
    }

    grantCastleRights(rights: CastleRight[]): void {
        rights.forEach((right) => {
            this.castleRights[right] = true
        })
    }

    getCastleRightsForColor(color: PlayerColor): CastleRight[] {
        return CastlingMove.rightsByColor[color].filter((type) => this.castleRights[type]);
    }

    clone(): BoardState {
        const state = new BoardState()
        state.castleRights.K = this.castleRights.K
        state.castleRights.Q = this.castleRights.Q
        state.castleRights.k = this.castleRights.k
        state.castleRights.q = this.castleRights.q
        state.enPassantTarget = this.enPassantTarget
        state.halfMoveClock = this.halfMoveClock
        state.ply = this.ply
        state.sideToMove = this.sideToMove
        return state
    }

    #updatePawnMove(move: Move) {
        this.halfMoveClock = 0;
        if(move.type !== 'double-pawn-move'){
            this.enPassantTarget = null
            return
        }
        // @ts-ignore this checks out
        this.enPassantTarget =  move.newSquare.file + (move.newSquare.rank === 4 ? '3' : '6')
    }

    #updatePieceMove(move: Move) {
        this.enPassantTarget = null
        if(move.captured){
            this.halfMoveClock = 0;
        }
    }

    #updateRookMove(move: Move) {
        this.#updatePieceMove(move)
        // rook's only revoke a specific square
        const revokes: CastlingMove|null = CastlingMove.byRookStartSquare[move.moving.startSquare] ?? null
        if(revokes){
            this.castleRights[revokes.right] = false
        }
    }

    #updateKingMove(move: Move) {
        this.#updatePieceMove(move)
        // revoke all castling rights for moving color
        CastlingMove.rightsByColor[move.moving.color].forEach((right) => {
            this.castleRights[right] = false
        })
    }
}