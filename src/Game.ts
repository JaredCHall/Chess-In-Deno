import {Board} from "./Board.ts";
import {MoveFactory} from "./MoveFactory.ts";
import { SquareName } from "./Square.ts";
import {Move} from "./Move.ts";
import {FenNumber} from "./FenNumber.ts";
import {MoveHandler} from "./MoveHandler.ts";

export class Game {

    readonly board: Board

    readonly fenNumber: FenNumber

    readonly moveHandler: MoveHandler

    readonly moveFactory: MoveFactory

    readonly notationType = 'coordinate'

    constructor(fenNumber: string|FenNumber) {
        this.fenNumber = new FenNumber(fenNumber)
        this.board = new Board(fenNumber)
        this.moveHandler = new MoveHandler(this.board)
        this.moveFactory = new MoveFactory(this.fenNumber)
    }


    // get legal moves for piece on selected square
    getMoves(square: SquareName): Move[]
    {
        return this.moveFactory.getLegalMoves(square, this.fenNumber)
    }

    #getMoveFromNotation(notation: string, type: string): Move
    {
        switch(type){
            case 'coordinate': this.moveFactory.makeFromCoordinateNotation(notation, this.fenNumber)
        }
        throw new Error(`Unsupported move notation type: ${type}`)
    }

    // make move from notation
    makeMove(notation: string): void
    {
        const move = this.#getMoveFromNotation(notation, this.notationType)
        this.moveHandler.makeMove(move)
        this.moveHandler.updateFenNumber(this.fenNumber, move)
        // make move on factory as well, so it will be correct for next move
        this.moveFactory.handler.makeMove(move)
    }

    // undo the last move
    undoLastMove(): void
    {

    }

}