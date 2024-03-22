import {Square, SquareName} from "./Square.ts";
import {Piece} from "./Piece.ts";
import {PlayerColor} from "../Player.ts";

export type MoveType = 'simple' | 'double-pawn-move' | 'en-passant' | 'castles'

// info on castling moves
export enum CastlingRight {
    K= 1,
    Q=1 << 1,
    k=1 << 2,
    q=1 << 3
}
export class CastlingMove {
    right: CastlingRight = CastlingRight.K // name of the castling right
    king:  SquareName[] = [] // king's start/end squares
    rook:  SquareName[] = [] // rook's start/end squares
    empty: SquareName[] = [] // squares that must be empty
    safe:  SquareName[] = [] // squares that must be safe

    static readonly moves: Record<CastlingRight, CastlingMove> = {
        1: {right: CastlingRight.K,king:['e1','g1'],rook:['h1','f1'],empty:['f1','g1'], safe:['e1','f1','g1']},
        2: {right: CastlingRight.Q,king:['e1','c1'],rook:['a1','d1'],empty:['d1','c1','b1'], safe:['e1','d1','c1']},
        4: {right: CastlingRight.k,king:['e8','g8'],rook:['h8','f8'],empty:['f8','g8'], safe:['e8','f8','g8']},
        8: {right: CastlingRight.q,king:['e8','c8'],rook:['a8','d8'],empty:['d8','c8','b8'], safe:['e8','d8','c8']}
    }
    static readonly byKingNewSquare: Partial<Record<SquareName, CastlingMove>> = {
        g1: this.moves[CastlingRight.K], c1: this.moves[CastlingRight.Q],
        g8: this.moves[CastlingRight.k], c8: this.moves[CastlingRight.q],
    }
    static readonly rightsByRookStartSquare: Partial<Record<SquareName, CastlingRight>> = {
        h1: CastlingRight.K, a1: CastlingRight.Q,
        h8: CastlingRight.k, a8: CastlingRight.q,
    }
    static readonly rightsByColor: Record<PlayerColor, number> = {
        w: CastlingRight.K | CastlingRight.Q,
        b: CastlingRight.k | CastlingRight.q,
    }
    static readonly movesByColor: Record<PlayerColor, CastlingMove[]> = {
        w: [this.moves[CastlingRight.K], this.moves[CastlingRight.Q]],
        b: [this.moves[CastlingRight.k], this.moves[CastlingRight.q]]
    }
}


export class Move
{
    readonly oldSquare: Square

    readonly newSquare: Square

    readonly moving: Piece

    readonly captured: Piece|null

    readonly type: MoveType

    promoteType: 'b'|'q'|'n'|'r'|null

    isCheck: boolean = false

    isMate: boolean = false

    constructor(oldSquare: Square, newSquare: Square, moving: Piece, captured: Piece|null, type: MoveType = 'simple', promoteType: 'b'|'q'|'n'|'r'|null = null) {
        this.oldSquare = oldSquare
        this.newSquare = newSquare
        this.moving = moving
        this.captured = captured
        this.type = type
        this.promoteType = promoteType
    }
}