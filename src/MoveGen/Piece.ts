import {Player, PlayerColor} from "../Player.ts";
import {Square, SquareName, SquareRank} from "./Square.ts";


export type PieceType = 'p'|'n'|'b'|'r'|'k'|'q'

export type PromotionType = 'q'|'r'|'b'|'n'

export enum PieceCode {
    // first bit says if piece is white or black, all other bits represent piece types
    white   = 0b00000001,
    pawn    = 0b00000010, // 1 << 1, // second bit says if it is white or black
    bpawn   = 0b00000100, // a pawn that moves toward the 1st rank (ex. 00000110 - a black pawn)
    knight  = 0b00001000,
    bishop  = 0b00010000,
    rook    = 0b00100000,
    queen   = 0b01000000,
    king    = 0b10000000
}


export class Piece
{
    static readonly promotionTypes: PromotionType[] = ['n','b','r','q']

    static readonly pieceTypes: PieceType[] = ['p','n','b','r','k','q']

    static readonly promotionOriginRanks: Record<PlayerColor, SquareRank> = {w:7, b:2}

    static readonly pawnDoubleMoveOriginRanks: Record<PlayerColor, SquareRank> = {w: 2, b:7}

    readonly color: 'w'|'b'

    readonly startSquare: SquareName // name of starting square

    type: PieceType // name of current type, because of pawn promotion this can change

    square: SquareName // name of currently occupied square, last occupied if captured

    readonly direction: -1|1 // for pawns, which either move up (-1) or down (1) the board

    readonly pieceCode: number

    constructor(type: PieceType, color: PlayerColor, startSquare:SquareName = 'a8') {
        this.type = type
        this.color = color
        this.startSquare = startSquare
        this.square = startSquare
        this.direction = color === 'w' ? -1 : 1
        this.pieceCode = this.getPieceCode()
    }

    getPieceCode(): number
    {
        if(this.type === 'p'){
            return this.color === 'w' ? PieceCode.pawn | PieceCode.white : PieceCode.pawn | PieceCode.bpawn
        }

        const isWhite = this.color === 'w' ? 1 : 0
        switch(this.type){
            case 'n': return PieceCode.knight | isWhite
            case 'b': return PieceCode.bishop | isWhite
            case 'r': return PieceCode.rook | isWhite
            case 'q': return PieceCode.queen | isWhite
            case 'k': return PieceCode.king | isWhite
        }
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
        // @ts-ignore - this is on purpose
        if(!Piece.pieceTypes.includes(type)) {
            throw new Error(`Invalid piece type: '${type}'.`)
        }
        // @ts-ignore this is correct
        return type
    }

    static sanitizePromoteType(promoteType: string): PromotionType {
        // @ts-ignore - this is on purpose
        if(!Piece.promotionTypes.includes(promoteType)) {
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
}