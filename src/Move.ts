import {SquareName} from "./Square.ts";
import {Piece} from "./Piece.ts";
import {SquareSet} from "./SquareSet.ts";


export type MoveType = 'simple' | 'double-pawn-move' | 'en-passant' | 'pawn-promotion' | 'king-side-castles' | 'queen-side-castles'

export class Move
{
    readonly oldSquare: SquareName

    readonly newSquare: SquareName

    readonly moving: Piece

    readonly captured: Piece|null

    readonly type: MoveType

    readonly promoteType: 'b'|'q'|'n'|'r'|null

    constructor(oldSquare: SquareName, newSquare: SquareName, moving: Piece, captured: Piece|null, type: MoveType = 'simple', promoteType: 'b'|'q'|'n'|'r'|null = null) {
        this.oldSquare = oldSquare
        this.newSquare = newSquare
        this.moving = moving.clone()
        this.captured = captured?.clone() ?? null
        this.type = type
        this.promoteType = promoteType
    }

    movePieces(squares: SquareSet): void
    {
        if(this.type === 'king-side-castles' || this.type === 'queen-side-castles'){
            return this.#makeCastlingMove(squares)
        }

        if(this.type === 'en-passant'){
            return this.#makeEnPassantMove(squares)
        }

        if(this.type === 'pawn-promotion'){
            squares.promotePiece(squares.getPiece(this.oldSquare),this.promoteType ?? 'q')
        }

        return this.#makeSimpleMove(squares, this.oldSquare, this.newSquare, this.captured instanceof Piece)
    }

    #makeSimpleMove(squares: SquareSet, oldSquare: SquareName, newSquare: SquareName, isCapture: boolean = false)
    {
        const moving = squares.getPiece(oldSquare)
        squares.setSquare(oldSquare, null)
        squares.setSquare(newSquare, moving, isCapture)
    }

    #makeCastlingMove(squares: SquareSet): void
    {
        if(this.type === 'king-side-castles'){
            if(this.moving.color === 'w'){
                this.#makeSimpleMove(squares, 'e1', 'g1')
                this.#makeSimpleMove(squares, 'h1', 'f1')
            }else{
                this.#makeSimpleMove(squares, 'e8', 'g8')
                this.#makeSimpleMove(squares, 'h8', 'f8')
            }
            return
        }else if(this.type === 'queen-side-castles'){
            if(this.moving.color === 'w'){
                this.#makeSimpleMove(squares, 'e1', 'c1')
                this.#makeSimpleMove(squares, 'a1', 'd1')
            }else{
                this.#makeSimpleMove(squares, 'e8', 'c8')
                this.#makeSimpleMove(squares, 'a8', 'd8')
            }
            return
        }
        throw new Error(`Unexpected castles-type`)
    }

    #makeEnPassantMove(squares: SquareSet): void
    {
        if(!this.captured?.square){
            throw new Error('Cannot make EnPassant Move. No captured piece provided')
        }

        this.#makeSimpleMove(squares, this.oldSquare, this.newSquare)
        squares.setSquare(this.captured.square, null, true)
    }


    serialize(): string
    {
        switch(this.type){
            case "king-side-castles":
                return 'O-O'
            case 'queen-side-castles':
                return 'O-O-O'
        }

        let serialized = this.oldSquare + this.newSquare

        if(this.type === 'pawn-promotion'){
            serialized += '='+this.moving.type.toUpperCase()
        }
        return serialized
    }

}