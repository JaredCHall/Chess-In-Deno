import {Piece, PieceType} from "./Piece.ts";
import {SquareName} from "./Square.ts";
import {PlayerColor} from "./Player.ts";


export type PieceStartSquareMap = Partial<Record<SquareName, Piece>>
export type PiecesByColorMap = Record<PieceType, PieceStartSquareMap>

export class PieceMap
{
    pieces: Record<PlayerColor, PiecesByColorMap> = {
        w: {k: {}, q: {}, r: {}, n: {}, b: {}, p: {},},
        b: {k: {}, q: {}, r: {}, n: {}, b: {}, p: {},},
    }

    captures: Record<PlayerColor, PieceStartSquareMap> = {
        w: {},
        b: {},
    }

    addPiece(piece: Piece): void
    {
        delete this.captures[piece.color][piece.startSquare]
        this.pieces[piece.color][piece.type][piece.startSquare] = piece
    }

    removePiece(piece: Piece): void
    {
        delete this.pieces[piece.color][piece.type][piece.startSquare]
        this.captures[piece.color][piece.startSquare] = piece
    }

    getKing(color: PlayerColor): null|Piece {
        return Object.values(this.pieces[color].k)[0] ?? null
    }

    changePieceType(oldType: PieceType, piece: Piece)
    {
        delete this.pieces[piece.color][oldType][piece.startSquare]
        this.pieces[piece.color][piece.type][piece.startSquare] = piece
    }

    getPieceList(color: PlayerColor, type: PieceType|null = null): Piece[]
    {
        if(!type){
            return this.getPieceList(color, 'k')
                .concat(this.getPieceList(color, 'q'))
                .concat(this.getPieceList(color, 'r'))
                .concat(this.getPieceList(color, 'b'))
                .concat(this.getPieceList(color, 'n'))
                .concat(this.getPieceList(color, 'p'))
        }

        return Object.values(this.pieces[color][type])
    }

    getCapturesList(color: PlayerColor): Piece[]
    {
        return Object.values(this.captures[color])
    }

    flush(): void
    {
        this.pieces = {
            w: {k: {}, q: {}, r: {}, n: {}, b: {}, p: {},},
            b: {k: {}, q: {}, r: {}, n: {}, b: {}, p: {},},
        }
        this.captures = {w: {}, b:{}}
    }

    serialize(): string {
        const pieceSquares = (piece: Piece) => {
            return !piece.square ? piece.startSquare : piece.square
        }

        return [
            this.getPieceList('w','k').map(pieceSquares).join(''),
            this.getPieceList('w','q').map(pieceSquares).join(''),
            this.getPieceList('w','r').map(pieceSquares).join(''),
            this.getPieceList('w','b').map(pieceSquares).join(''),
            this.getPieceList('w','n').map(pieceSquares).join(''),
            this.getPieceList('w','p').map(pieceSquares).join(''),
            this.getPieceList('b','k').map(pieceSquares).join(''),
            this.getPieceList('b','q').map(pieceSquares).join(''),
            this.getPieceList('b','r').map(pieceSquares).join(''),
            this.getPieceList('b','b').map(pieceSquares).join(''),
            this.getPieceList('b','n').map(pieceSquares).join(''),
            this.getPieceList('b','p').map(pieceSquares).join(''),
            this.getCapturesList('w').map(pieceSquares).join(''),
            this.getCapturesList('b').map(pieceSquares).join(''),
        ].join('/')

    }
}