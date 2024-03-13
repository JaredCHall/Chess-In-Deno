import {SquareSet} from "../src/SquareSet.ts";
import {assertEquals, assertInstanceOf} from "https://deno.land/std@0.219.0/assert/mod.ts";
import {Piece} from "../src/Piece.ts";
import {Square} from "../src/Square.ts";


Deno.test('It sets board from FEN number', () => {

    const squares = new SquareSet('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

    // black pieces
    assertEquals(squares.a8.getPiece(), Piece.fromString('r','a8'))
    assertEquals(squares.b8.getPiece(), Piece.fromString('n','b8'))
    assertEquals(squares.c8.getPiece(), Piece.fromString('b','c8'))
    assertEquals(squares.d8.getPiece(), Piece.fromString('q','d8'))
    assertEquals(squares.e8.getPiece(), Piece.fromString('k','e8'))
    assertEquals(squares.f8.getPiece(), Piece.fromString('b','f8'))
    assertEquals(squares.g8.getPiece(), Piece.fromString('n','g8'))
    assertEquals(squares.h8.getPiece(), Piece.fromString('r','h8'))

    // white pieces
    assertEquals(squares.a1.getPiece(), Piece.fromString('R','a1'))
    assertEquals(squares.b1.getPiece(), Piece.fromString('N','b1'))
    assertEquals(squares.c1.getPiece(), Piece.fromString('B','c1'))
    assertEquals(squares.d1.getPiece(), Piece.fromString('Q','d1'))
    assertEquals(squares.e1.getPiece(), Piece.fromString('K','e1'))
    assertEquals(squares.f1.getPiece(), Piece.fromString('B','f1'))
    assertEquals(squares.g1.getPiece(), Piece.fromString('N','g1'))
    assertEquals(squares.h1.getPiece(), Piece.fromString('R','h1'))

    const blackPawns = ['a7','b7','c7','d7','e7','f7','g7','h7']
    blackPawns.forEach((squareName) => assertEquals(
        squares.getSquare(Square.sanitizeName(squareName)).getPiece(),
        Piece.fromString('p', squareName)
    ))

    const whitePawns = ['a2','b2','c2','d2','e2','f2','g2','h2']
    whitePawns.forEach((squareName) => assertEquals(
        squares.getSquare(Square.sanitizeName(squareName)).getPiece(),
        Piece.fromString('P', squareName)
    ))

    const emptySquares = [
        'a6','b6','c6','d6','e6','f6','g6','h6',
        'a5','b5','c5','d5','e5','f5','g5','h5',
        'a4','b4','c4','d4','e4','f4','g4','h4',
        'a3','b3','c3','d3','e3','f3','g3','h3',
    ]
    emptySquares.forEach((squareName) => assertEquals(squares.getSquare(Square.sanitizeName(squareName)).hasPiece(), false))


    // assert piece set created correctly
    const pieceStartingSquares = [
        "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
        "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
        "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
        "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"
    ]
    pieceStartingSquares.forEach((squareName) => assertInstanceOf(
        squares.pieceSet.pieces[squareName],
        Piece
    ))

    assertEquals(squares.getPieceList('w',['p']).length, 8)
    assertEquals(squares.getPieceList('w',['b']).length, 2)
    assertEquals(squares.getPieceList('w',['n']).length, 2)
    assertEquals(squares.getPieceList('w',['r']).length, 2)
    assertEquals(squares.getPieceList('w',['q']).length, 1)
    assertEquals(squares.getPieceList('w',['k']).length, 1)

    assertEquals(squares.getPieceList('b',['p']).length, 8)
    assertEquals(squares.getPieceList('b',['b']).length, 2)
    assertEquals(squares.getPieceList('b',['n']).length, 2)
    assertEquals(squares.getPieceList('b',['r']).length, 2)
    assertEquals(squares.getPieceList('b',['q']).length, 1)
    assertEquals(squares.getPieceList('b',['k']).length, 1)
})

Deno.test('It serializes as FEN piece position string', () => {

    // New Game FEN

    const squares = new SquareSet
    squares.a8.setPiece(Piece.fromString('r'))
    squares.b8.setPiece(Piece.fromString('n'))
    squares.c8.setPiece(Piece.fromString('b'))
    squares.d8.setPiece(Piece.fromString('q'))
    squares.e8.setPiece(Piece.fromString('k'))
    squares.f8.setPiece(Piece.fromString('b'))
    squares.g8.setPiece(Piece.fromString('n'))
    squares.h8.setPiece(Piece.fromString('r'))

    squares.a1.setPiece(Piece.fromString('R'))
    squares.b1.setPiece(Piece.fromString('N'))
    squares.c1.setPiece(Piece.fromString('B'))
    squares.d1.setPiece(Piece.fromString('Q'))
    squares.e1.setPiece(Piece.fromString('K'))
    squares.f1.setPiece(Piece.fromString('B'))
    squares.g1.setPiece(Piece.fromString('N'))
    squares.h1.setPiece(Piece.fromString('R'))

    const blackPawns = ['a7','b7','c7','d7','e7','f7','g7','h7']
    blackPawns.forEach((squareName) =>
        squares.getSquare(Square.sanitizeName(squareName)).setPiece(Piece.fromString('p')),
    )

    const whitePawns = ['a2','b2','c2','d2','e2','f2','g2','h2']
    whitePawns.forEach((squareName) =>
        squares.getSquare(Square.sanitizeName(squareName)).setPiece(Piece.fromString('P')),
    )

    assertEquals(squares.serialize(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')

})

Deno.test('It makes moves', () => {

    // New Game FEN

    const squares = new SquareSet('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    squares.makeMove(squares.getMove('e2','e4', 'double-pawn-move'))
    squares.makeMove(squares.getMove('a7','a5', 'double-pawn-move'))
    squares.makeMove(squares.getMove('g1','f3'))
    squares.makeMove(squares.getMove('a5','a4'))
    squares.makeMove(squares.getMove('b2','b4', 'double-pawn-move'))
    squares.makeMove(squares.getMove('a4','b3','en-passant'))
    squares.makeMove(squares.getMove('f1','c4'))
    squares.makeMove(squares.getMove('b3','c2'))
    squares.makeMove(squares.getMove('e1', 'g1', 'king-side-castles'))
    squares.makeMove(squares.getMove('c2','d1','pawn-promotion','n'))

    assertEquals(squares.serialize(), 'rnbqkbnr/1ppppppp/8/8/2B1P3/5N2/P2P1PPP/RNBn1RK1')

    assertEquals(squares.getPieceList('w',['p']).length, 6)
    assertEquals(squares.getPieceList('w',['b']).length, 2)
    assertEquals(squares.getPieceList('w',['n']).length, 2)
    assertEquals(squares.getPieceList('w',['r']).length, 2)
    assertEquals(squares.getPieceList('w',['q']).length, 0)
    assertEquals(squares.getPieceList('w',['k']).length, 1)

    assertEquals(squares.getPieceList('b',['p']).length, 7)
    assertEquals(squares.getPieceList('b',['b']).length, 2)
    assertEquals(squares.getPieceList('b',['n']).length, 3)
    assertEquals(squares.getPieceList('b',['r']).length, 2)
    assertEquals(squares.getPieceList('b',['q']).length, 1)
    assertEquals(squares.getPieceList('b',['k']).length, 1)

    // confirm the a7 pawn is now a knight
    assertEquals(squares.pieceSet.blackPieceTypeMap.n['a7'], null)
    // and is currently on the d1 square
    assertEquals(squares.pieceSet.pieces['a7'].square, 'd1')

})