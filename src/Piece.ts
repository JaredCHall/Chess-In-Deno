import {Player, PlayerColor} from "./Player.ts";
import {Square, SquareName} from "./Square.ts";


export type PieceType = 'p'|'n'|'b'|'r'|'k'|'q'

export type PromotionType = 'q'|'r'|'b'|'n'

export class Piece
{
    static readonly PAWN = 'p'
    static readonly KNIGHT = 'n'
    static readonly BISHOP = 'b'
    static readonly ROOK = 'r'
    static readonly KING = 'k'
    static readonly QUEEN = 'q'

    readonly color: 'w'|'b'

    type: PieceType

    square: SquareName // name of currently occupied square, last occupied if captured

    readonly startSquare: SquareName // name of starting square

    static readonly TYPES = ['p','n','b','r','k','q']

    constructor(type: PieceType, color: PlayerColor, startSquare:SquareName = 'a8') {
        this.type = type
        this.color = color
        this.startSquare = startSquare
        this.square = startSquare
    }

    static fromString(serialized: string, square: string|null = null): Piece
    {
        const type = Piece.sanitizeType(serialized.toLowerCase())
        const color = serialized.toUpperCase() === serialized ? Player.WHITE : Player.BLACK

        if(!square){
            return new Piece(type, color)
        }
        return new Piece(type, color, Square.sanitizeName(square))
    }

    static sanitizeType(type: string): PieceType
    {
        switch(type){
            case 'p':
            case 'n':
            case 'b':
            case 'r':
            case 'k':
            case 'q':
                return type
            default:
                throw new Error(`Invalid piece type: '${type}'.`)
        }
    }

    static sanitizePromoteType(promoteType: string): PromotionType
    {
        switch(promoteType){
            case 'n':
            case 'b':
            case 'r':
            case 'q':
                return promoteType
            default:
                throw new Error(`Invalid promotion type: '${promoteType}'.`)
        }
    }

    promote(type: PieceType)
    {
        if(this.type !== 'p'){
            throw new Error(`Cannot promote piece of type ${this.type}. Piece is not a pawn.`)
        }

        if(type === 'k' || type === 'p'){
            throw new Error(`Invalid promotion type: ${type}`)
        }

        this.type = type
    }

    demote(): void
    {
        if(this.type === 'p'){
            throw new Error(`Cannot demote piece of type ${this.type}. Piece is already a pawn.`)
        }

        this.type = 'p'
    }

    serialize(): PieceType
    {
        if(this.color === Player.BLACK){
            return this.type
        }
        // @ts-ignore - uppercase versions are always valid
        return this.type.toUpperCase()
    }

    clone(): Piece
    {
        const piece = new Piece(this.type, this.color, this.startSquare)
        piece.square = this.square
        return piece
    }
}