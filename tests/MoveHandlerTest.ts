import {Board} from "../src/Board.ts";
import {MoveHandler} from "../src/MoveHandler.ts";
import {Move} from "../src/Move.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import { Piece } from "../src/Piece.ts";
import {FenNumber} from "../src/FenNumber.ts";
import {SquareName} from "../src/Square.ts";
import {assertObjectMatch} from "https://deno.land/std@0.219.0/assert/assert_object_match.ts";
import {assertInstanceOf} from "https://deno.land/std@0.219.0/assert/assert_instance_of.ts";
import {PieceMap} from "../src/PieceMap.ts";

const getPiece = (board: Board, square: SquareName): Piece => {
    const piece = board.getPiece(square)
    if(!piece) throw new Error(`No piece on square: ${square}`)
    return piece
}

const assertInPieceMap = (map: PieceMap, piece: Piece): void => {
    const mapPiece = map.pieces[piece.color][piece.type][piece.startSquare] ?? null
    assertInstanceOf(mapPiece, Piece)
    // @ts-ignore - this works
    assertObjectMatch(mapPiece, piece)
}

const assertNotInPieceMap = (map: PieceMap, piece: Piece): void => {
    const mapPiece = map.pieces[piece.color][piece.type][piece.startSquare] ?? null
    assertEquals(mapPiece, null)
}

const assertInCaptureMap  = (map: PieceMap, piece: Piece): void => {
    const mapPiece = map.captures[piece.color][piece.startSquare] ?? null
    assertInstanceOf(mapPiece, Piece)
    // @ts-ignore - this works
    assertObjectMatch(mapPiece, piece)
}

const assertNotInCaptureMap = (map: PieceMap, piece: Piece): void => {
    const mapPiece = map.captures[piece.color][piece.startSquare] ?? null
    assertEquals(mapPiece, null)
}


Deno.test('it makes simple move', () => {

    const board = new Board('3k4/8/8/6r1/8/5N2/8/3K4')
    const handler = new MoveHandler(board)

    const move = new Move('f3','e5',getPiece(board,'f3'), null)
    board.render()
    handler.makeMove(move)
    board.render()
    assertEquals(board.serialize(), '3k4/8/8/4N1r1/8/8/8/3K4')

    const movedPiece = getPiece(board, 'e5')
    assertInPieceMap(board.pieceMap, movedPiece)
    // ensure start square and square are updated
    assertEquals(movedPiece.startSquare,'f3')
    assertEquals(movedPiece.square, 'e5')

    // Test un-making the move
    handler.unMakeMove(move)
    board.render()
    assertEquals(board.serialize(), '3k4/8/8/6r1/8/5N2/8/3K4')

    const movedPieceRedux = getPiece(board, 'f3')
    // @ts-ignore - this is fine
    assertObjectMatch(movedPiece,movedPieceRedux)
    assertInPieceMap(board.pieceMap, movedPieceRedux)
    // ensure start square and square are updated
    assertEquals(movedPieceRedux.startSquare,'f3')
    assertEquals(movedPieceRedux.square, 'f3')
})



Deno.test('it makes move with capture', () => {

    const board = new Board('3k4/8/8/6r1/8/5N2/8/3K4')
    const handler = new MoveHandler(board)

    const movedPiece = getPiece(board, 'f3')
    const capturedPiece = getPiece(board, 'g5')

    const move = new Move('f3','g5',getPiece(board, 'f3'), capturedPiece)
    board.render()
    handler.makeMove(move)
    board.render()
    assertEquals(board.serialize(), '3k4/8/8/6N1/8/8/8/3K4')
    // assert piece map updated correctly
    assertInPieceMap(board.pieceMap, movedPiece)
    assertNotInPieceMap(board.pieceMap, capturedPiece)
    assertInCaptureMap(board.pieceMap, capturedPiece)
    // assert captured piece's square property is still g5
    assertEquals(capturedPiece.square, 'g5')

    handler.unMakeMove(move)
    board.render()
    assertEquals(board.serialize(), '3k4/8/8/6r1/8/5N2/8/3K4')

    assertInPieceMap(board.pieceMap, movedPiece)
    assertInPieceMap(board.pieceMap, capturedPiece)
    assertNotInCaptureMap(board.pieceMap, capturedPiece)
    // ensure start square and square are updated
    assertEquals(movedPiece.startSquare,'f3')
    assertEquals(movedPiece.square, 'f3')
})

Deno.test('it makes double pawn move', () => {
    const board = new Board('3k4/8/8/8/8/8/1K3P2/8')
    const handler = new MoveHandler(board)

    board.render()
    handler.makeMove(new Move('f2','f4',getPiece(board,'f2'), null,'double-pawn-move'))
    board.render()

    assertEquals(board.serialize(), '3k4/8/8/8/5P2/8/1K6/8')
    assertInPieceMap(board.pieceMap, getPiece(board,'f4'))
})

Deno.test('it makes en-passant move', () => {

    const board = new Board('3k4/8/8/8/1pP5/8/1K6/8')
    const handler = new MoveHandler(board)

    const move = new Move('b4','c3',getPiece(board,'b4'), getPiece(board,'c4'),'en-passant')
    board.render()
    handler.makeMove(move)
    board.render()

    assertEquals(board.pieceMap.getPieceList('w','p'), [])
    assertEquals(board.serialize(), '3k4/8/8/8/8/2p5/1K6/8')

    handler.unMakeMove(move)
    board.render()

    assertEquals(board.serialize(), '3k4/8/8/8/1pP5/8/1K6/8')
    // @ts-ignore - assert captured pawn is back where expected
    assertObjectMatch(board.pieceMap.getPieceList('w','p')[0], board.getPiece('c4'))

})

Deno.test('It castles as white', () => {

    const board = new Board('r3k2r/8/8/8/8/8/8/R3K2R')
    const handler = new MoveHandler(board)

    const king = getPiece(board,'e1')
    const rookA = getPiece(board,'a1')
    const rookH = getPiece(board,'h1')

    const shortCastles = new Move('e1','g1', king, rookA, 'castles')
    board.render()
    handler.makeMove(shortCastles)
    board.render()
    assertEquals(board.serialize(),'r3k2r/8/8/8/8/8/8/R4RK1')

    handler.unMakeMove(shortCastles)
    board.render()
    assertEquals(board.serialize(), 'r3k2r/8/8/8/8/8/8/R3K2R')

    const longCastles = new Move('e1','c1', king, rookH, 'castles')
    handler.makeMove(longCastles)
    board.render()
    assertEquals(board.serialize(), 'r3k2r/8/8/8/8/8/8/2KR3R')

    handler.unMakeMove(longCastles)
    board.render()
    assertEquals(board.serialize(), 'r3k2r/8/8/8/8/8/8/R3K2R')

})

Deno.test('It castles as black', () => {

    const board = new Board('r3k2r/8/8/8/8/8/8/R3K2R')
    const handler = new MoveHandler(board)

    const king = getPiece(board,'e8')
    const rookA = getPiece(board,'a8')
    const rookH = getPiece(board,'h8')

    const shortCastles = new Move('e8','g8', king, rookA, 'castles')
    board.render()
    handler.makeMove(shortCastles)
    board.render()
    assertEquals(board.serialize(),'r4rk1/8/8/8/8/8/8/R3K2R')

    handler.unMakeMove(shortCastles)
    board.render()
    assertEquals(board.serialize(), 'r3k2r/8/8/8/8/8/8/R3K2R')

    const longCastles = new Move('e8','c8', king, rookH, 'castles')
    handler.makeMove(longCastles)
    board.render()
    assertEquals(board.serialize(), '2kr3r/8/8/8/8/8/8/R3K2R')

    handler.unMakeMove(longCastles)
    board.render()
    assertEquals(board.serialize(), 'r3k2r/8/8/8/8/8/8/R3K2R')

})

Deno.test('It promotes pawn', () => {

    const board = new Board('2k5/6P1/8/8/8/8/1p6/2N1K3')
    const handler = new MoveHandler(board)

    const whitePawn = getPiece(board,'g7')
    const blackPawn = getPiece(board,'b2')
    const whiteKnight = getPiece(board,'c1')

    let move = new Move('g7', 'g8', whitePawn, null, 'pawn-promotion', 'q')

    // promotes to queen
    board.render()
    handler.makeMove(move)
    board.render()
    assertEquals(board.serialize(),'2k3Q1/8/8/8/8/8/1p6/2N1K3')

    handler.unMakeMove(move)
    board.render()
    assertEquals(board.serialize(), '2k5/6P1/8/8/8/8/1p6/2N1K3')

    // promotes to bishop
    move = new Move('g7', 'g8', whitePawn, null, 'pawn-promotion', 'b')
    handler.makeMove(move)
    board.render()
    assertEquals(board.serialize(),'2k3B1/8/8/8/8/8/1p6/2N1K3')
    assertInPieceMap(board.pieceMap, whitePawn)
    assertEquals(whitePawn.type, 'b')

    handler.unMakeMove(move)
    board.render()
    assertEquals(board.serialize(), '2k5/6P1/8/8/8/8/1p6/2N1K3')
    assertInPieceMap(board.pieceMap, whitePawn)
    assertEquals(whitePawn.type, 'p')

    // promotes to bishop
    move = new Move('b2', 'c1', blackPawn, whiteKnight, 'pawn-promotion', 'n')
    handler.makeMove(move)
    board.render()
    assertEquals(board.serialize(),'2k5/6P1/8/8/8/8/8/2n1K3')
    assertInPieceMap(board.pieceMap, blackPawn)
    assertNotInPieceMap(board.pieceMap, whiteKnight)
    assertInCaptureMap(board.pieceMap, whiteKnight)
    assertEquals(blackPawn.type, 'n')

    handler.unMakeMove(move)
    board.render()
    assertInPieceMap(board.pieceMap, blackPawn)
    assertEquals(blackPawn.type, 'p')
    assertInPieceMap(board.pieceMap, whiteKnight)
    assertNotInCaptureMap(board.pieceMap, whiteKnight)

    // promotes to rook
    move = new Move('b2', 'c1', blackPawn, whiteKnight, 'pawn-promotion', 'r')
    handler.makeMove(move)
    board.render()
    assertInPieceMap(board.pieceMap, blackPawn)
    assertNotInPieceMap(board.pieceMap, whiteKnight)
    assertInCaptureMap(board.pieceMap, whiteKnight)
    assertEquals(blackPawn.type, 'r')

    handler.unMakeMove(move)
    board.render()
    assertInPieceMap(board.pieceMap, blackPawn)
    assertEquals(blackPawn.type, 'p')
    assertInPieceMap(board.pieceMap, whiteKnight)
    assertNotInCaptureMap(board.pieceMap, whiteKnight)
})