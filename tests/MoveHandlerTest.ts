import {Board} from "../src/Board.ts";
import {MoveHandler} from "../src/MoveHandler.ts";
import {Move} from "../src/Move.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {Piece} from "../src/Piece.ts";
import {SquareName} from "../src/Square.ts";
import { assert } from "https://deno.land/std@0.219.0/assert/assert.ts";
import {FenNumber} from "../src/FenNumber.ts";

Deno.test('it updates fen numbers', () => {
    const fen = new FenNumber('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq')
    const handler = getHandler(fen.serialize())

    const e1King = getPiece(handler, 'e1')
    const e2Pawn = getPiece(handler, 'e2')
    const g8Knight = getPiece(handler,'g8')
    const h8Rook = getPiece(handler, 'h8')

    let move = new Move('e2','e4', e2Pawn, null, 'double-pawn-move')

    // sets en-passant target
    makeMove(handler, move)
    handler.updateFenNumber(fen, move)
    assertEquals(fen.serialize(), 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')

    // revokes en-passant target
    move = new Move('g8','f6', g8Knight, null)
    makeMove(handler, move)
    handler.updateFenNumber(fen, move)
    assertEquals(fen.serialize(), 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2')

    // moving the king should revoke all castle rights for white
    move = new Move('e1','e2', e1King, null)
    makeMove(handler, move)
    handler.updateFenNumber(fen, move)
    assertEquals(fen.serialize(), 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPPKPPP/RNBQ1BNR b kq - 2 2')

    // moving the h8 rook should revoke short castle rights for black
    move = new Move('h8','g8', h8Rook, null)
    makeMove(handler, move)
    handler.updateFenNumber(fen, move)
    assertEquals(fen.serialize(), 'rnbqkbr1/pppppppp/5n2/8/4P3/8/PPPPKPPP/RNBQ1BNR w q - 3 3')

})

Deno.test('it makes simple move', () => {
    const handler = getHandler('3k4/8/8/6r1/8/5N2/8/3K4')
    const whiteKnight = getPiece(handler,'f3');
    const move = new Move('f3','e5',whiteKnight, null)

    makeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/4N1r1/8/8/8/3K4')
    assertPieceOnSquare(handler, 'e5', whiteKnight)

    unMakeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/6r1/8/5N2/8/3K4')
    assertPieceOnSquare(handler, 'f3', whiteKnight)
})

Deno.test('it makes move with capture', () => {
    const handler = getHandler('3k4/8/8/6r1/8/5N2/8/3K4')
    const movedPiece = getPiece(handler, 'f3')
    const capturedPiece = getPiece(handler, 'g5')
    const move = new Move('f3','g5',movedPiece, capturedPiece)

    makeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/6N1/8/8/8/3K4')
    assertPieceOnSquare(handler, 'g5', movedPiece)
    assertPieceCaptured(handler, capturedPiece, 'g5')

    unMakeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/6r1/8/5N2/8/3K4')
    assertPieceOnSquare(handler, 'g5', capturedPiece)
})

Deno.test('it makes en-passant move', () => {
    const handler = getHandler('3k4/8/8/8/1pP5/8/1K6/8')
    const blackPawn = getPiece(handler,'b4')
    const whitePawn = getPiece(handler,'c4')
    const move = new Move('b4','c3',blackPawn, whitePawn,'en-passant')

    makeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/8/8/2p5/1K6/8')
    assertPieceOnSquare(handler,'c3',blackPawn)
    assertPieceCaptured(handler, whitePawn,'c4')

    unMakeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/8/1pP5/8/1K6/8')
    assertPieceOnSquare(handler,'b4',blackPawn)
    assertPieceOnSquare(handler,'c4',whitePawn)
})

Deno.test('It castles short and long', () => {
    const handler = getHandler('r3k2r/8/8/8/8/8/8/R3K2R')
    const whiteKing = getPiece(handler,'e1')
    const rookA1 = getPiece(handler,'a1')
    const rookH1 = getPiece(handler,'h1')
    const blackKing = getPiece(handler,'e8')
    const rookA8 = getPiece(handler,'a8')
    const rookH8 = getPiece(handler,'h8')

    // castles short as white
    let move = new Move('e1','g1', whiteKing, rookA1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler,'r3k2r/8/8/8/8/8/8/R4RK1')
    assertPieceOnSquare(handler, 'g1', whiteKing)
    assertPieceOnSquare(handler, 'f1', rookH1)
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e1', whiteKing)
    assertPieceOnSquare(handler, 'h1', rookH1)

    // castles long as white
    move = new Move('e1','c1', whiteKing, rookH1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/2KR3R')
    assertPieceOnSquare(handler, 'c1', whiteKing)
    assertPieceOnSquare(handler, 'd1', rookA1)
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e1', whiteKing)
    assertPieceOnSquare(handler, 'a1', rookA1)

    // castles short as black
    move = new Move('e8','g8', blackKing, rookA1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler,'r4rk1/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'g8', blackKing)
    assertPieceOnSquare(handler, 'f8', rookH8)
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e8', blackKing)
    assertPieceOnSquare(handler, 'h8', rookH8)

    // castles long as black
    move = new Move('e8','c8', whiteKing, rookH1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler, '2kr3r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'c8', blackKing)
    assertPieceOnSquare(handler, 'd8', rookA8)
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e8', blackKing)
    assertPieceOnSquare(handler, 'a8', rookA8)
})

Deno.test('It promotes pawn', () => {
    const board = new Board('2k5/6P1/8/8/8/8/1p6/2N1K3')
    const handler = new MoveHandler(board)
    const whitePawn = getPiece(handler,'g7')
    const blackPawn = getPiece(handler,'b2')
    const whiteKnight = getPiece(handler,'c1')

    // promotes to queen
    let move = new Move('g7', 'g8', whitePawn, null, 'pawn-promotion', 'q')
    makeMove(handler, move)
    assertSerializesTo(handler,'2k3Q1/8/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'q')
    assertPieceOnSquare(handler,'g8', whitePawn)
    unMakeMove(handler, move)
    assertSerializesTo(handler, '2k5/6P1/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'p')
    assertPieceOnSquare(handler,'g7', whitePawn)

    // promotes to bishop
    move = new Move('g7', 'g8', whitePawn, null, 'pawn-promotion', 'b')
    makeMove(handler, move)
    assertSerializesTo(handler,'2k3B1/8/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'b')
    assertPieceOnSquare(handler, 'g8', whitePawn)
    unMakeMove(handler, move)
    assertSerializesTo(handler, '2k5/6P1/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'p')
    assertPieceOnSquare(handler,'g7', whitePawn)

    // promotes to bishop
    move = new Move('b2', 'c1', blackPawn, whiteKnight, 'pawn-promotion', 'n')
    makeMove(handler, move)
    assertSerializesTo(handler,'2k5/6P1/8/8/8/8/8/2n1K3')
    assertEquals(blackPawn.type, 'n')
    assertPieceOnSquare(handler, 'c1', blackPawn)
    assertPieceCaptured(handler, whiteKnight, 'c1')
    unMakeMove(handler, move)
    assertSerializesTo(handler, '2k5/6P1/8/8/8/8/1p6/2N1K3')
    assertEquals(blackPawn.type, 'p')
    assertPieceOnSquare(handler, 'b2', blackPawn)
    assertPieceOnSquare(handler, 'c1', whiteKnight)

    // promotes to rook
    move = new Move('b2', 'c1', blackPawn, whiteKnight, 'pawn-promotion', 'r')
    makeMove(handler, move)
    assertSerializesTo(handler, '2k5/6P1/8/8/8/8/8/2r1K3')
    assertEquals(blackPawn.type, 'r')
    assertPieceOnSquare(handler, 'c1', blackPawn)
    assertPieceCaptured(handler, whiteKnight, 'c1')
    unMakeMove(handler, move)
    assertSerializesTo(handler, '2k5/6P1/8/8/8/8/1p6/2N1K3')
    assertEquals(blackPawn.type, 'p')
    assertPieceOnSquare(handler, 'b2', blackPawn)
    assertPieceOnSquare(handler, 'c1', whiteKnight)
})

/**
 * Test Utility Methods
 */

const getHandler = (fen: string): MoveHandler => {
    const handler = new MoveHandler(new Board(fen))
    handler.board.render()
    return handler
}

const makeMove = (handler: MoveHandler, move: Move): void => {
    handler.makeMove(move)
    handler.board.render()
}

const unMakeMove = (handler: MoveHandler, move: Move): void => {
    handler.unMakeMove(move)
    handler.board.render()
}

const getPiece = (handler: MoveHandler, square: SquareName): Piece => {
    const piece = handler.board.getPiece(square)
    if(!piece) throw new Error(`No piece on square: ${square}`)
    return piece
}

const assertSerializesTo = (handler: MoveHandler, fenString: string) => {
    assertEquals(handler.board.serialize(), fenString, 'Fen position string matches')
}

const assertPieceOnSquare = (handler: MoveHandler, square: SquareName, piece: Piece): void => {
    const currentPiece = getPiece(handler,square)
    assertEquals(piece.square, square,`Piece(${piece.serialize()}).square equals expected square: ${square}`)
    assert(currentPiece === piece,`Current piece on square: ${square}, is same object`)
    assertInPieceMap(handler, piece)
    assertNotInCaptureMap(handler, piece)
}

const assertPieceCaptured = (handler: MoveHandler, piece: Piece, capturedOn: SquareName): void => {
    assertEquals(piece.square, capturedOn, `Captured piece square property matches the square it was captured on.`)
    assertNotInPieceMap(handler, piece)
    assertInCaptureMap(handler, piece)
}

const assertInPieceMap = (handler: MoveHandler, piece: Piece): void => {
    assert(handler.board.pieceMap.pieces[piece.color][piece.type][piece.startSquare] === piece, `Piece(${piece.serialize()}) is in the piece map`)
}

const assertNotInPieceMap = (handler: MoveHandler, piece: Piece): void => {
    assert(handler.board.pieceMap.pieces[piece.color][piece.type][piece.startSquare] === undefined, `Piece(${piece.serialize()}) is not in the piece map`)
}

const assertInCaptureMap  = (handler: MoveHandler, piece: Piece): void => {
    assert(handler.board.pieceMap.captures[piece.color][piece.startSquare] === piece, `Piece(${piece.serialize()}) is in the capture map`)
}

const assertNotInCaptureMap = (handler: MoveHandler, piece: Piece): void => {
    assert(handler.board.pieceMap.captures[piece.color][piece.startSquare] === undefined, `Piece(${piece.serialize()}) is not in the capture map`)
}