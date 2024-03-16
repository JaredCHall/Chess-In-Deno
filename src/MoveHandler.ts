import {Board} from "./Board.ts";
import {Move} from "./Move.ts";
import {Piece, PromotionType} from "./Piece.ts";
import {FenNumber} from "./FenNumber.ts";
import {Square, SquareName} from "./Square.ts";

export class MoveHandler {

    readonly board: Board

    readonly fenNumber: FenNumber|null

    constructor(board: Board, fenNumber: FenNumber|null = null) {
        this.board = board
        this.fenNumber = fenNumber
    }

    makeMove(move: Move)
    {
        switch(move.type){
            case 'castles': this.#makeCastlingMove(move); break;
            case 'en-passant': this.#makeEnPassantMove(move); break;
            case 'pawn-promotion':
                this.#promotePiece(move.moving, move.promoteType ?? 'q')
                /* falls through */
            default:
                this.#makeSimpleMove(move.oldSquare, move.newSquare, this.board.getPiece(move.newSquare))
        }

        if(this.fenNumber){
            this.fenNumber.piecePlacements = this.board.serialize()
            this.#revokeCastleRights(this.fenNumber, move)
            this.#setEnPassantTarget(this.fenNumber, move)
        }
    }

    unMakeMove(move: Move)
    {
        switch(move.type){
            case 'castles': return this.#unmakeCastlingMove(move)
            case 'en-passant': return this.#unmakeEnPassantMove(move)
            case 'pawn-promotion': this.#demotePiece(move.moving)
        }
        this.#makeSimpleMove(move.newSquare, move.oldSquare)

        if(move.captured instanceof Piece){
            this.#restorePiece(move.captured, move.newSquare)
        }
    }



    #capturePiece(piece: Piece): void {
        this.board.pieceMap.removePiece(piece)
        piece.square = null
    }

    #restorePiece(piece: Piece, square: SquareName): void {
        this.board.pieceMap.addPiece(piece)
        this.board.setPiece(square, piece)
    }

    #promotePiece(piece: Piece, promoteType: PromotionType): void {
        piece.promote(promoteType)
        this.board.pieceMap.changePieceType('p', piece)
    }

    #demotePiece(piece: Piece): void {
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
        switch(Move.castlesTypeByTargetSquare(move.newSquare)){
            case 'K':
                this.#makeSimpleMove('e1', 'g1')
                this.#makeSimpleMove('h1', 'f1')
                break
            case 'k':
                this.#makeSimpleMove('e8', 'g8')
                this.#makeSimpleMove('h8', 'f8')
                break
            case 'Q':
                this.#makeSimpleMove('e1', 'c1')
                this.#makeSimpleMove('a1', 'd1')
                break
            case 'q':
                this.#makeSimpleMove('e8', 'c8')
                this.#makeSimpleMove('a8', 'd8')
                break
            default:
                throw new Error(`Unexpected castles-type`)
        }
    }
    #unmakeCastlingMove(move: Move): void
    {
        switch(Move.castlesTypeByTargetSquare(move.newSquare)){
            case 'K':
                this.#makeSimpleMove('g1', 'e1')
                this.#makeSimpleMove('f1', 'h1')
                return
            case 'k':
                this.#makeSimpleMove('e8', 'g8')
                this.#makeSimpleMove('h8', 'f8')
                return
            case 'Q':
                this.#makeSimpleMove('c1', 'e1')
                this.#makeSimpleMove('d1', 'a1')
                return
            case 'q':
                this.#makeSimpleMove('e8', 'c8')
                this.#makeSimpleMove('a8', 'd8')
                return
            default:
                throw new Error(`Unexpected castles-type`)
        }
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

    // Methods for updating FenNumber

    #setEnPassantTarget(fenNumber: FenNumber,move: Move)
    {
        if(move.type !== 'double-pawn-move'){
            fenNumber.enPassantTarget = null
            return
        }

        const square = Square.fromString(move.newSquare)
        fenNumber.enPassantTarget = Square.sanitizeName(square.file + (square.rank === 4 ? '3' : '6'))
    }

    #revokeCastleRights(fenNumber: FenNumber, move: Move)
    {
        const currentCastleRights = fenNumber.getCastleRightsForColor(move.moving.color)

        if(currentCastleRights.length === 0){
            return
        }

        if(move.moving.type === 'r'){
            const type = Move.castleTypeByRookStartSquare(move.moving.startSquare)
            if(currentCastleRights.includes(type)){
                fenNumber.revokeCastleRights([type])
            }
            return
        }
        if(move.moving.type === 'k'){
            fenNumber.revokeCastleRights(currentCastleRights)
        }
    }
}