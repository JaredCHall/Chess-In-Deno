import {SquareName} from "./Square.ts";
import {PlayerColor} from "../Player.ts";
import {CastlingMove, CastlingRight, Move} from "./Move.ts";


export class BoardState {

    castleRights: number = 0b0000
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

    clone(): BoardState {
        const state = new BoardState()
        state.castleRights = this.castleRights
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

        // @ts-ignore ok
        this.castleRights &= ~CastlingMove.rightsByRookStartSquare[move.moving.startSquare]

    }

    #updateKingMove(move: Move) {
        this.#updatePieceMove(move)

        // revoke all castling rights for moving color
        this.castleRights &= ~CastlingMove.rightsByColor[move.moving.color]
    }
}