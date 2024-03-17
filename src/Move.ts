import {SquareName} from "./Square.ts";
import {Piece} from "./Piece.ts";
import {CastleRight} from "./FenNumber.ts";


export type MoveType = 'simple' | 'double-pawn-move' | 'en-passant' | 'pawn-promotion' | 'castles'

export class Move
{
    readonly oldSquare: SquareName

    readonly newSquare: SquareName

    readonly moving: Piece

    readonly captured: Piece|null

    readonly type: MoveType

    readonly promoteType: 'b'|'q'|'n'|'r'|null

    isCheck: boolean = false

    isMate: boolean = false

    constructor(oldSquare: SquareName, newSquare: SquareName, moving: Piece, captured: Piece|null, type: MoveType = 'simple', promoteType: 'b'|'q'|'n'|'r'|null = null) {
        this.oldSquare = oldSquare
        this.newSquare = newSquare
        this.moving = moving
        this.captured = captured ?? null
        this.type = type
        this.promoteType = promoteType
    }

    static castlesTypeByTargetSquare(square: SquareName): CastleRight
    {
        switch(square){
            case 'g1': return 'K'
            case 'c1': return 'Q'
            case 'g8': return 'k'
            case 'c8': return 'q'
            default: throw new Error(`Invalid target square: ${square} for Castling Move.`)
        }
    }

    static castleTypeByRookStartSquare(square: SquareName): CastleRight
    {
        switch(square){
            case 'a1': return 'Q'
            case 'h1': return 'K'
            case 'a8': return 'q'
            case 'h8': return 'k'
            default: throw new Error(`Invalid rook start square: ${square} for Castling Move.`)
        }
    }

    serialize(): string
    {
        let serialized = this.oldSquare + this.newSquare
        if(this.type === 'castles'){
            switch(Move.castlesTypeByTargetSquare(this.newSquare)){
                case 'K':
                case 'k':
                    serialized = 'O-O'
                    break
                case 'Q':
                case 'q':
                    serialized = 'O-O-O'
                    break
            }
        }

        if(this.type === 'pawn-promotion'){
            serialized += '='+this.moving.type.toUpperCase()
        }
        return serialized
    }

}