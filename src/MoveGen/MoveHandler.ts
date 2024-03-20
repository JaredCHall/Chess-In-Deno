import {Board} from "./Board.ts";
import {CastlingMove, Move} from "./Move.ts";
import {Piece, PromotionType} from "./Piece.ts";
import {Square} from "./Square.ts";

export class MoveHandler extends Board {
    makeMove(move: Move)
    {
        switch(move.type){
            case 'castles': this.#makeCastlingMove(move); break;
            case 'en-passant': this.#makeEnPassantMove(move); break;
            default:
                this.#makeSimpleMove(move.oldSquare, move.newSquare, move.captured)
        }

        if(move.promoteType){
            this.#promotePiece(move.newSquare, move.promoteType)
        }
        // save and update the existing board state for use in unMakes
        this.saveCurrentState()
        this.boardState.update(move)
    }

    unMakeMove(move: Move)
    {
        switch(move.type){
            case 'castles': this.#unmakeCastlingMove(move); break;
            case 'en-passant': this.#unmakeEnPassantMove(move); break;
            default:
                this.#makeSimpleMove(move.newSquare, move.oldSquare)
                if(move.captured){
                    this.#restorePiece(move.captured, move.newSquare)
                }
        }
        if(move.promoteType){
            this.#demotePiece(move.oldSquare)
        }
        this.restoreLastState()
    }

    #makeSimpleMove(oldSquare: Square, newSquare: Square, capturedPiece: Piece|null = null)
    {
        //@ts-ignore - ok
        const moving: Piece = oldSquare.piece
        oldSquare.setEmpty()
        if(capturedPiece){
            this.#capturePiece(capturedPiece)
        }
        newSquare.piece = moving
        moving.square = newSquare.name
    }

    #capturePiece(piece: Piece): void {
        this.pieceMap.removePiece(piece)
    }

    #restorePiece(piece: Piece, square: Square): void {
        delete this.pieceMap.captures[piece.color][piece.startSquare]
        this.pieceMap.addPiece(piece)
        square.piece = piece
    }

    #promotePiece(square: Square, promoteType: PromotionType): void {
        const piece = this.getPiece(square.name)
        if(!piece){
            throw new Error(`Cannot promote piece. No piece on square: ${square.name}`)
        }
        piece.promote(promoteType)
        this.pieceMap.changePieceType('p', piece)
    }

    #demotePiece(square: Square): void {
        const piece = this.getPiece(square.name)
        if(!piece){
            throw new Error(`Cannot promote piece. No piece on square: ${square.name}`)
        }
        const oldType = piece.type
        piece.demote()
        this.pieceMap.changePieceType(oldType, piece)
    }

    #makeCastlingMove(move: Move): void {
        // @ts-ignore - it's fine
        const castlesType: CastlingMove = CastlingMove.byKingNewSquare[move.newSquare.name]
        this.#makeSimpleMove(this.getSquare(castlesType.king[0]), this.getSquare(castlesType.king[1]))
        this.#makeSimpleMove(this.getSquare(castlesType.rook[0]), this.getSquare(castlesType.rook[1]))
    }
    #unmakeCastlingMove(move: Move): void {
        // @ts-ignore - it's fine
        const castlesType: CastlingMove = CastlingMove.byKingNewSquare[move.newSquare.name]
        this.#makeSimpleMove(this.getSquare(castlesType.king[1]), this.getSquare(castlesType.king[0]))
        this.#makeSimpleMove(this.getSquare(castlesType.rook[1]), this.getSquare(castlesType.rook[0]))
    }

    #makeEnPassantMove(move: Move): void {
        // @ts-ignore we need speed
        const capturedPawn: Piece = move.captured
        this.#capturePiece(capturedPawn)
        this.setEmpty(capturedPawn.square)
        this.#makeSimpleMove(move.oldSquare, move.newSquare)
    }

    #unmakeEnPassantMove(move: Move): void {
        // @ts-ignore we need speed
        const capturedPiece: Piece = move.captured
        this.#makeSimpleMove(move.newSquare, move.oldSquare)
        this.#restorePiece(capturedPiece, this.getSquare(capturedPiece.square))
    }
}