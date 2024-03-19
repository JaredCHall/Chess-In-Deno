import {Player, PlayerColor} from "./Player.ts";
import {Square, SquareName} from "./Square.ts";


export type PieceType = 'p'|'n'|'b'|'r'|'k'|'q'

export type PromotionType = 'q'|'r'|'b'|'n'

export class Piece
{
    readonly color: 'w'|'b'

    readonly startSquare: SquareName // name of starting square

    type: PieceType // name of current type, because of pawn promotion this can change

    square: SquareName // name of currently occupied square, last occupied if captured

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

    static sanitizeType(type: string): PieceType {
        if(!['p','n','b','r','k','q'].includes(type)) {
            throw new Error(`Invalid piece type: '${type}'.`)
        }
        // @ts-ignore this is correct
        return type
    }

    static sanitizePromoteType(promoteType: string): PromotionType {
        if(!['n','b','r','k',].includes(promoteType)) {
            throw new Error(`Invalid promotion type: '${promoteType}'.`)
        }
        // @ts-ignore this is correct
        return promoteType
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