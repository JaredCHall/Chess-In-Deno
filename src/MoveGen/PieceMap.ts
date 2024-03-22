import {Piece, PieceType} from "./Piece.ts";
import {SquareName} from "./Square.ts";
import {PlayerColor} from "../Player.ts";


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

    kings: Record<PlayerColor, Piece|undefined> = {
        w: undefined,
        b: undefined,
    }

    addPiece(piece: Piece): void
    {
        if(piece.type === 'k'){
            this.kings[piece.color] = piece
        }

        delete this.captures[piece.color][piece.startSquare]
        this.pieces[piece.color][piece.type][piece.startSquare] = piece
    }

    removePiece(piece: Piece): void
    {
        delete this.pieces[piece.color][piece.type][piece.startSquare]
        this.captures[piece.color][piece.startSquare] = piece
    }

    getKing(color: PlayerColor): Piece {
        // @ts-ignore - too slow
        return this.kings[color]
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

        const pieces: Piece[] = []
        for(const i in this.pieces[color][type]){
            // @ts-ignore let's try it
            pieces.push(this.pieces[color][type][i])
        }
        return pieces
    }

    getCapturesList(color: PlayerColor): Piece[]
    {
        const pieces: Piece[] = []
        for(const i in this.captures[color]){
            // @ts-ignore let's try it
            pieces.push(this.pieces[color][i])
        }
        return pieces
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