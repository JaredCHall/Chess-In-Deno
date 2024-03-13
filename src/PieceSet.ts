import {Piece, PieceType, PromotionType} from "./Piece.ts";
import {Player} from "./Player.ts";
import {SquareName} from "./Square.ts";

// map of each piece type to its starting squares
class PieceTypeMap {
    p: Record<string, null> = {}
    b: Record<string, null> = {}
    n: Record<string, null> = {}
    r: Record<string, null> = {}
    q: Record<string, null> = {}
    k: Record<string, null> = {}

    add(piece: Piece): void
    {
        if(piece.startSquare === null){
            throw new Error('Cannot add a piece that does not have a starting square.')
        }

        this[piece.type][piece.startSquare] = null
    }

    remove(piece: Piece): void
    {
        if(piece.startSquare === null){
            throw new Error('Cannot remove a piece that does not have a starting square.')
        }

        delete this[piece.type][piece.startSquare]
    }

    getStartSquares(type: PieceType): string[]{
        return Object.keys(this[type])
    }

    flush(): void
    {
        this.p = {}
        this.b = {}
        this.n = {}
        this.r = {}
        this.q = {}
        this.k = {}
    }

}

export class PieceSet
{
    // indexed by starting square name
    pieces: Record<string, Piece> = {}
    captured: Record<string, Piece> = {}

    readonly whitePieceTypeMap = new PieceTypeMap()

    readonly blackPieceTypeMap= new PieceTypeMap()


    promotePiece(piece: Piece, promoteType: PromotionType): void
    {
        const map = this.getTypeMapForColor(piece.color)
        map.remove(piece)
        piece.promote(promoteType)
        map.add(piece)
    }

    getPieces(color: 'w'|'b'|null = null, types: string[] = Piece.TYPES): Piece[]
    {
        // relevant piece maps
        const maps = color === null ? [this.whitePieceTypeMap, this.blackPieceTypeMap] : [this.getTypeMapForColor(color)]

        // find all the starting squares
        let startSquares: string[] = []
        for(let i = 0; i < types.length; i++){
            const type: PieceType = Piece.sanitizeType(types[i])
            for(let n = 0; n < maps.length; n ++){
                startSquares = startSquares.concat(maps[n].getStartSquares(type))
            }
        }

        // build piece list
        const pieceList: Piece[] = []
        for(const j in startSquares){
            pieceList.push(this.pieces[startSquares[j]])
        }

        return pieceList
    }

    addPiece(piece: Piece)
    {
        if(piece.startSquare === null){
            throw new Error('Cannot add a piece that does not have a starting square.')
        }

        if(this.pieces[piece.startSquare] !== undefined){
            throw new Error(`Piece with starting square: '${piece.startSquare}' already exists in piece set.`)
        }

        this.pieces[piece.startSquare] = piece

        this.getTypeMapForColor(piece.color).add(piece)
    }

    flush(): void {
        this.pieces = {}
        this.captured = {}
        this.blackPieceTypeMap.flush()
        this.whitePieceTypeMap.flush()
    }

    removeCapturedPiece(piece: Piece): void {
        if(piece.startSquare === null){
            throw new Error('Cannot remove a piece that does not have a starting square.')
        }

        delete this.pieces[piece.startSquare]
        this.captured[piece.startSquare] = piece
        this.getTypeMapForColor(piece.color).remove(piece)
    }

    private getTypeMapForColor(color: 'w'|'b'): PieceTypeMap
    {
        return color === Player.WHITE ? this.whitePieceTypeMap : this.blackPieceTypeMap;
    }

}