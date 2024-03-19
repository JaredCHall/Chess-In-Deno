import {Square, SquareName} from "./Square.ts";
import {Piece} from "./Piece.ts";
import {PlayerColor} from "../Player.ts";

export type MoveType = 'simple' | 'double-pawn-move' | 'en-passant' | 'castles'

// info on castling moves
export type CastleRight = 'K' | 'Q' | 'k' | 'q'
export class CastlingMove {
    right: CastleRight = 'K'// name of the castling right
    king:  SquareName[] = [] // king's start/end squares
    rook:  SquareName[] = [] // rook's start/end squares
    empty: SquareName[] = [] // squares that must be empty
    safe:  SquareName[] = [] // squares that must be safe

    static readonly moves: Record<CastleRight, CastlingMove> = {
        'K': {right:'K',king:['e1','g1'],rook:['h1','f1'],empty:['f1','g1'], safe:['e1','f1','g1']},
        'Q': {right:'Q',king:['e1','c1'],rook:['a1','d1'],empty:['d1','c1','b1'], safe:['e1','d1','c1']},
        'k': {right:'k',king:['e8','g8'],rook:['h8','f8'],empty:['f8','g8'], safe:['e8','f8','g8']},
        'q': {right:'q',king:['e8','c8'],rook:['a8','d8'],empty:['d8','c8','b8'], safe:['e8','d8','c8']}
    }
    static readonly byKingNewSquare: Partial<Record<SquareName, CastlingMove>> = {
        'g1': this.moves['K'], 'c1': this.moves['Q'],
        'g8': this.moves['k'], 'c8': this.moves['q'],
    }
    static readonly byRookStartSquare: Partial<Record<SquareName, CastlingMove>> = {
        h1: this.moves['K'], a1: this.moves['Q'],
        h8: this.moves['k'], a8: this.moves['q'],
    }
    static readonly rightsByColor: Record<PlayerColor, CastleRight[]> = {
        w: ['K','Q'],
        b: ['k','q'],
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
        this.captured = captured ?? null
        this.type = type
        this.promoteType = promoteType
    }
}