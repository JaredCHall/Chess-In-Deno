
import {Board} from "./src/Board.ts";

const board = new Board()
board.setStartingPosition()

console.log(board.squareSet.serialize())