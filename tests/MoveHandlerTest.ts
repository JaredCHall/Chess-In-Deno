import {Board} from "../src/Board.ts";
import {MoveHandler} from "../src/MoveHandler.ts";
import {Move} from "../src/Move.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import { Piece } from "../src/Piece.ts";
import {FenNumber} from "../src/FenNumber.ts";
import {SquareName} from "../src/Square.ts";

const getPiece = (board: Board, square: SquareName): Piece => {
    const piece = board.getPiece(square)
    if(!piece) throw new Error(`No piece on square: ${square}`)
    return piece
}

Deno.test('it makes simple move', () => {

    const board = new Board('3k4/8/8/6r1/8/5N2/8/3K4')
    const handler = new MoveHandler(board)

    board.render()
    handler.makeMove(new Move('f3','e5',getPiece(board,'f3'), null))
    board.render()

    assertEquals(board.serialize(), '3k4/8/8/4N1r1/8/8/8/3K4')
    assertEquals(board.pieceMap.getPieceList('w','n'), [board.getPiece('e5')])
})

Deno.test('it makes simple move with capture', () => {

    const board = new Board('3k4/8/8/6r1/8/5N2/8/3K4')
    const handler = new MoveHandler(board)

    board.render()
    handler.makeMove(new Move('f3','g5',getPiece(board, 'f3'), board.getPiece('g5')))
    board.render()

    assertEquals(board.serialize(), '3k4/8/8/6N1/8/8/8/3K4')
    assertEquals(board.pieceMap.getPieceList('w','n'), [board.getPiece('g5')])
    assertEquals(board.pieceMap.getPieceList('b','r'), [])
    assertEquals(board.pieceMap.getCapturesList('b').map((piece: Piece) => piece.serialize()), ['r'])
})

Deno.test('it makes double pawn move and updates FEN', () => {

    const fen = new FenNumber('3k4/8/8/8/8/8/1K3P2/8')
    const board = new Board(fen)
    const handler = new MoveHandler(board, fen)

    board.render()
    handler.makeMove(new Move('f2','f4',getPiece(board,'f2'), null,'double-pawn-move'))
    board.render()

    assertEquals(board.serialize(), '3k4/8/8/8/5P2/8/1K6/8')
    assertEquals(fen.piecePlacements, '3k4/8/8/8/5P2/8/1K6/8')
    assertEquals(fen.enPassantTarget, 'f3')
})

Deno.test('it makes en-passant move and updates FEN', () => {

    const fen = new FenNumber('3k4/8/8/8/1pP5/8/1K6/8')
    const board = new Board(fen)
    const handler = new MoveHandler(board, fen)

    board.render()
    handler.makeMove(new Move('b4','c3',getPiece(board,'b4'), getPiece(board,'c4'),'en-passant'))
    board.render()

    assertEquals(board.pieceMap.getPieceList('w','p'), [])
    assertEquals(board.serialize(), '3k4/8/8/8/8/2p5/1K6/8')
    assertEquals(fen.piecePlacements, '3k4/8/8/8/8/2p5/1K6/8')
    assertEquals(fen.enPassantTarget, null)
})
