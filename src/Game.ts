import {Board} from "./MoveGen/Board.ts";
import {MoveGenerator} from "./MoveGen/MoveGenerator.ts";
import { SquareName } from "./MoveGen/Square.ts";
import {Move} from "./MoveGen/Move.ts";
import {FenNumber} from "./FenNumber.ts";
import {MoveHandler} from "./MoveGen/MoveHandler.ts";

export class Game {
    readonly fenNumber: FenNumber
    readonly moveHandler: MoveHandler // moves pieces on the board
    readonly moveFactory: MoveGenerator // generates moves for user move selection
    readonly notationType = 'coordinate'
    get board(): Board{return this.moveHandler} // the board is the move handler is the board

    constructor(fenNumber: string|FenNumber) {
        this.fenNumber = new FenNumber(fenNumber)
        this.moveHandler = new MoveHandler(this.fenNumber)
        this.moveFactory = new MoveGenerator(this.fenNumber)
    }

    getMoves(square: SquareName): Move[] {
        return this.moveFactory.getLegalMoves(square)
    }

    makeMove(notation: string): void {
        const move = this.#getMoveFromNotation(notation, this.notationType)
        this.moveHandler.makeMove(move)
        // make move on factory as well, so it will be correct for next move
        this.moveFactory.makeMove(move)
    }



    // undo the last move
    undoLastMove(): void
    {

    }

    #getMoveFromNotation(notation: string, type: string): Move
    {
        switch(type){
            case 'coordinate': this.moveFactory.makeFromCoordinateNotation(notation)
        }
        throw new Error(`Unsupported move notation type: ${type}`)
    }

}