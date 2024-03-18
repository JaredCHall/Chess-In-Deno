import {SquareName} from "../Square.ts";

export type CastleRight = 'K' | 'Q' | 'k' | 'q'

export class CastlesType
{
    readonly right: CastleRight
    readonly kingSquares: [SquareName, SquareName]
    readonly rookSquares: [SquareName, SquareName]
    readonly emptySquares: SquareName[]
    readonly safeSquares: SquareName[]

    constructor(
        right: CastleRight,
        kingSquares: [SquareName, SquareName],
        rookSquares: [SquareName, SquareName],
        emptySquares: SquareName[],
        safeSquares: SquareName[],
    ) {
        this.right = right
        this.kingSquares = kingSquares
        this.rookSquares = rookSquares
        this.emptySquares = emptySquares
        this.safeSquares = safeSquares
    }

}

export type KingTargetSquares = 'g1' | 'c1' | 'g8' | 'c8'

export class CastlingMoves {

    static readonly whiteShort = new CastlesType('K', ['e1','g1'], ['h1','f1'], ['f1','g1'], ['e1','f1','g1'])
    static readonly whiteLong = new CastlesType('Q', ['e1','c1'], ['a1','d1'], ['d1','c1','b1'], ['e1','d1','c1'])
    static readonly blackShort = new CastlesType('k', ['e8','g8'], ['h8','f8'], ['f8','g8'], ['e8','f8','g8'])
    static readonly blackLong = new CastlesType('q', ['e8','c8'], ['a8','d8'], ['d8','c8','b8'], ['e8','d8','c8'])

    static readonly rightMap: Record<CastleRight, CastlesType> = {
        K: CastlingMoves.whiteShort,
        Q: CastlingMoves.whiteLong,
        k: CastlingMoves.blackShort,
        q: CastlingMoves.blackLong,
    }
    static readonly targetSquareMap: Record<KingTargetSquares, CastlesType> = {
        g1: CastlingMoves.whiteShort,
        c1: CastlingMoves.whiteLong,
        g8: CastlingMoves.blackShort,
        c8: CastlingMoves.blackLong,
    }

    static get(right: CastleRight): CastlesType{
        return CastlingMoves.rightMap[right]
    }

    static getByTargetSquare(square: SquareName): CastlesType
    {
        //@ts-ignore - we are handling this
        const type =  this.targetSquareMap[square] ?? null
        if(!type){throw new Error(`Castling Move has invalid target square: ${square}`)}
        return type
    }
}