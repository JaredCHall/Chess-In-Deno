import {PieceSet} from "./PieceSet.ts";
import {SquareSet} from "./SquareSet.ts";
import {Piece} from "./Piece.ts";
import {FenNumber} from "./FenNumber.ts";


export class Board {
    

    readonly pieceSet: PieceSet

    readonly squareSet: SquareSet

    constructor() {
        this.pieceSet = new PieceSet()
        this.squareSet = new SquareSet()
    }

    setStartingPosition(): void
    {
        this.squareSet.setFromFen(new FenNumber('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'))
    }



    
}