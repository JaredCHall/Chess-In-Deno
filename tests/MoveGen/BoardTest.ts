import {Board} from "../../src/MoveGen/Board.ts";
import {assertEquals, assertInstanceOf} from "https://deno.land/std@0.219.0/assert/mod.ts";
import {Piece} from "../../src/MoveGen/Piece.ts";
import {Square, SquareName} from "../../src/MoveGen/Square.ts";


Deno.test('It sets board from FEN number', () => {
    const board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    board.render()

    // black pieces
    assertEquals(board.getPiece('a8'), Piece.fromString('r','a8'))
    assertEquals(board.getPiece('b8'), Piece.fromString('n','b8'))
    assertEquals(board.getPiece('c8'), Piece.fromString('b','c8'))
    assertEquals(board.getPiece('d8'), Piece.fromString('q','d8'))
    assertEquals(board.getPiece('e8'), Piece.fromString('k','e8'))
    assertEquals(board.getPiece('f8'), Piece.fromString('b','f8'))
    assertEquals(board.getPiece('g8'), Piece.fromString('n','g8'))
    assertEquals(board.getPiece('h8'), Piece.fromString('r','h8'))

    // white pieces
    assertEquals(board.getPiece('a1'), Piece.fromString('R','a1'))
    assertEquals(board.getPiece('b1'), Piece.fromString('N','b1'))
    assertEquals(board.getPiece('c1'), Piece.fromString('B','c1'))
    assertEquals(board.getPiece('d1'), Piece.fromString('Q','d1'))
    assertEquals(board.getPiece('e1'), Piece.fromString('K','e1'))
    assertEquals(board.getPiece('f1'), Piece.fromString('B','f1'))
    assertEquals(board.getPiece('g1'), Piece.fromString('N','g1'))
    assertEquals(board.getPiece('h1'), Piece.fromString('R','h1'))

    const blackPawns: SquareName[] = ['a7','b7','c7','d7','e7','f7','g7','h7']
    blackPawns.forEach((squareName) => assertEquals(
        board.getPiece(squareName),
        Piece.fromString('p', squareName)
    ))

    const whitePawns: SquareName[] = ['a2','b2','c2','d2','e2','f2','g2','h2']
    whitePawns.forEach((squareName) => assertEquals(
        board.getPiece(squareName),
        Piece.fromString('P', squareName)
    ))

    const emptySquares: SquareName[] = [
        'a6','b6','c6','d6','e6','f6','g6','h6',
        'a5','b5','c5','d5','e5','f5','g5','h5',
        'a4','b4','c4','d4','e4','f4','g4','h4',
        'a3','b3','c3','d3','e3','f3','g3','h3',
    ]
    emptySquares.forEach((squareName) => assertEquals(board.getPiece(squareName), null))

    // assert piece set created correctly
    assertEquals(
        board.pieceMap.serialize(),
        'e1/d1/a1h1/c1f1/b1g1/a2b2c2d2e2f2g2h2/e8/d8/a8h8/c8f8/b8g8/a7b7c7d7e7f7g7h7//'
    )

    assertEquals(
        board.serialize(),
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    )
})
