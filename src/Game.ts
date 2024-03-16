import {Board} from "./Board.ts";
import {MoveFactory} from "./MoveFactory.ts";
import { SquareName } from "./Square.ts";
import {Move} from "./Move.ts";

export class Game {

    board: Board

    moveFactory: MoveFactory


    // get legal moves for piece on selected square
    getMoves(square: SquareName): Record<SquareName,Move>
    {
        return {}
    }

    // make move from notation
    makeMove(notation: string): void
    {
        // parse notation into Move object
        // check move legality against MoveFactory
        // update board and moveFactory
        // update MoveHistory
    }

    // undo the last move
    undoLastMove(): void
    {

    }

}