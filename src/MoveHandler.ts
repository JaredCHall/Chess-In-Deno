import {Board} from "./Board.ts";
import {Move} from "./Move.ts";
import {Piece, PromotionType} from "./Piece.ts";
import {SquareName} from "./Square.ts";
import {CastlingMoves} from "./MoveGen/CastlingMoves.ts";

export class MoveHandler {

    readonly board: Board


    constructor(board: Board) {
        this.board = board
    }

    makeMove(move: Move)
    {
        switch(move.type){
            case 'castles': this.#makeCastlingMove(move); break;
            case 'en-passant': this.#makeEnPassantMove(move); break;
            default:
                this.#makeSimpleMove(move.oldSquare, move.newSquare, this.board.getPiece(move.newSquare))
        }

        if(move.promoteType){
            this.#promotePiece(move.newSquare, move.promoteType)
        }
        // save and update the existing board state for use in unMakes
        this.board.saveCurrentState()
        this.board.boardState.update(move)
    }

    unMakeMove(move: Move)
    {
        switch(move.type){
            case 'castles': this.#unmakeCastlingMove(move); break;
            case 'en-passant': this.#unmakeEnPassantMove(move); break;
            default:
                this.#makeSimpleMove(move.newSquare, move.oldSquare)
                if(move.captured instanceof Piece){
                    this.#restorePiece(move.captured, move.newSquare)
                }
        }

        if(move.promoteType){
            this.#demotePiece(move.oldSquare)
        }

        this.board.restoreLastState()
    }

    #capturePiece(piece: Piece): void {
        this.board.pieceMap.removePiece(piece)
    }

    #restorePiece(piece: Piece, square: SquareName): void {
        const originalPiece = this.board.pieceMap.captures[piece.color][piece.startSquare] ?? null
        if(!originalPiece){
            throw new Error(`Cannot restore piece: ${piece.serialize()}. Original piece does not exist in the capture map.`)
        }
        delete this.board.pieceMap.captures[piece.color][piece.startSquare]
        this.board.pieceMap.addPiece(originalPiece)
        this.board.setPiece(square, originalPiece)
    }

    #promotePiece(square: SquareName, promoteType: PromotionType): void {
        const piece = this.board.getPiece(square)
        if(!piece){
            throw new Error(`Cannot promote piece. No piece on square: ${square}`)
        }
        piece.promote(promoteType)
        this.board.pieceMap.changePieceType('p', piece)
    }

    #demotePiece(square: SquareName): void {
        const piece = this.board.getPiece(square)
        if(!piece){
            throw new Error(`Cannot promote piece. No piece on square: ${square}`)
        }

        const oldType = piece.type
        piece.demote()
        this.board.pieceMap.changePieceType(oldType, piece)
    }

    #makeSimpleMove(oldSquare: SquareName, newSquare: SquareName, capturedPiece: Piece|null = null)
    {
        const moving = this.board.getPiece(oldSquare)
        this.board.setPiece(oldSquare, null)
        if(capturedPiece){
            this.#capturePiece(capturedPiece)
        }
        this.board.setPiece(newSquare, moving)
    }

    #makeCastlingMove(move: Move): void
    {
        // @ts-ignore assumed passed Moves are valid
        const castlesType = CastlingMoves.getByTargetSquare(move.newSquare)

        this.#makeSimpleMove(castlesType.kingSquares[0], castlesType.kingSquares[1])
        this.#makeSimpleMove(castlesType.rookSquares[0], castlesType.rookSquares[1])
    }
    #unmakeCastlingMove(move: Move): void
    {
        // @ts-ignore assumed passed Moves are valid
        const castlesType = CastlingMoves.getByTargetSquare(move.newSquare)

        this.#makeSimpleMove(castlesType.kingSquares[1], castlesType.kingSquares[0])
        this.#makeSimpleMove(castlesType.rookSquares[1], castlesType.rookSquares[0])
    }

    #makeEnPassantMove(move: Move): void
    {
        if(!move.captured?.square){
            throw new Error('Cannot make EnPassant Move. No captured piece provided')
        }
        const capturedPawn = this.board.getPiece(move.captured.square)
        if(!capturedPawn) throw new Error(`Cannot en-passant. There is no pawn on square: ${move.captured.square}`)

        this.#capturePiece(capturedPawn)
        this.board.setPiece(move.captured.square, null)
        this.#makeSimpleMove(move.oldSquare, move.newSquare)
    }

    #unmakeEnPassantMove(move: Move): void
    {
        if(!move.captured?.square){
            throw new Error('Cannot make EnPassant Move. No captured piece provided')
        }

        this.#makeSimpleMove(move.newSquare, move.oldSquare)
        this.#restorePiece(move.captured, move.captured.square)
    }
}