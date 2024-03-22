import {Board} from "../../src/MoveGen/Board.ts";
import {MoveHandler} from "../../src/MoveGen/MoveHandler.ts";
import {CastlingRight, Move, MoveType} from "../../src/MoveGen/Move.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {Piece, PromotionType} from "../../src/MoveGen/Piece.ts";
import {SquareName} from "../../src/MoveGen/Square.ts";
import { assert } from "https://deno.land/std@0.219.0/assert/assert.ts";
import {assertFalse} from "https://deno.land/std@0.219.0/assert/assert_false.ts";

const newMove = (handler: MoveHandler, oldSquare: SquareName, newSquare: SquareName, moving: Piece, captured: Piece|null, type: MoveType = 'simple', promoteType: PromotionType|null = null): Move => {
    return new Move(
        handler.getSquare(oldSquare),
        handler.getSquare(newSquare),
        moving, captured, type, promoteType
    )
}

Deno.test('it makes simple move', () => {
    const handler = getHandler('3k4/8/8/6r1/8/5N2/8/3K4')
    const whiteKnight = getPiece(handler,'f3');
    const move = newMove(handler, 'f3','e5',whiteKnight, null)

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
    const move= newMove(handler, 'f3','g5',movedPiece, capturedPiece)

    makeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/6N1/8/8/8/3K4')
    assertPieceOnSquare(handler, 'g5', movedPiece)
    assertPieceCaptured(handler, capturedPiece, 'g5')

    unMakeMove(handler, move)
    assertSerializesTo(handler, '3k4/8/8/6r1/8/5N2/8/3K4')
    assertPieceOnSquare(handler, 'g5', capturedPiece)
})

Deno.test('it makes en-passant moves', () => {
    const handler = getHandler('3k4/8/8/8/1pP5/8/1K6/8')
    const blackPawn = getPiece(handler,'b4')
    const whitePawn = getPiece(handler,'c4')
    const move = newMove(handler, 'b4','c3',blackPawn, whitePawn,'en-passant')

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
    const handler = getHandler('r3k2r/8/8/8/8/8/8/R3K2R w KQkq')
    const whiteKing = getPiece(handler,'e1')
    const rookA1 = getPiece(handler,'a1')
    const rookH1 = getPiece(handler,'h1')
    const blackKing: Piece = getPiece(handler,'e8')
    const rookA8 = getPiece(handler,'a8')
    const rookH8 = getPiece(handler,'h8')

    console.log(handler.boardState.castleRights.toString(2))
    // castles short as white
    let move= newMove(handler, 'e1','g1', whiteKing, rookA1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler,'r3k2r/8/8/8/8/8/8/R4RK1')
    assertPieceOnSquare(handler, 'g1', whiteKing)
    assertPieceOnSquare(handler, 'f1', rookH1)
    assertFalse(handler.boardState.castleRights & (CastlingRight.K | CastlingRight.Q), 'it revokes castles rights for white')
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e1', whiteKing)
    assertPieceOnSquare(handler, 'h1', rookH1)
    assert(handler.boardState.castleRights & (CastlingRight.K | CastlingRight.Q), 'it restores castles rights for white')

    // castles long as white
    move = newMove(handler, 'e1','c1', whiteKing, rookH1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/2KR3R')
    assertPieceOnSquare(handler, 'c1', whiteKing)
    assertPieceOnSquare(handler, 'd1', rookA1)
    assertFalse(handler.boardState.castleRights & (CastlingRight.K | CastlingRight.Q), 'it revokes castles rights for white')
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e1', whiteKing)
    assertPieceOnSquare(handler, 'a1', rookA1)
    assert(handler.boardState.castleRights & (CastlingRight.K | CastlingRight.Q), 'it restores castles rights for white')

    // castles short as black
    move = newMove(handler, 'e8','g8', blackKing, rookA1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler,'r4rk1/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'g8', blackKing)
    assertPieceOnSquare(handler, 'f8', rookH8)
    assertFalse(handler.boardState.castleRights & (CastlingRight.k | CastlingRight.q), 'it revokes castles rights for black')
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e8', blackKing)
    assertPieceOnSquare(handler, 'h8', rookH8)
    assert(handler.boardState.castleRights & (CastlingRight.k | CastlingRight.q), 'it restores castles rights for black')

    // castles long as black
    move = newMove(handler, 'e8','c8', blackKing, rookH1, 'castles')
    makeMove(handler, move)
    assertSerializesTo(handler, '2kr3r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'c8', blackKing)
    assertPieceOnSquare(handler, 'd8', rookA8)
    assertFalse(handler.boardState.castleRights & (CastlingRight.k | CastlingRight.q), 'it revokes castles rights for black')
    unMakeMove(handler, move)
    assertSerializesTo(handler, 'r3k2r/8/8/8/8/8/8/R3K2R')
    assertPieceOnSquare(handler, 'e8', blackKing)
    assertPieceOnSquare(handler, 'a8', rookA8)
    assert(handler.boardState.castleRights & (CastlingRight.k | CastlingRight.q), 'it restores castles rights for black')
})

Deno.test('it revokes castling rights correctly for white', () => {
    const handler = getHandler('r3k2r/8/8/8/8/8/8/R3K2R w KQkq -')
    const king = getPiece(handler,'e1')
    const rookA = getPiece(handler,'a1')
    const rookH = getPiece(handler,'h1')

    // h rook moves
    let move= newMove(handler, 'h1','h2', rookH, null)
    makeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1110, 'it revokes short castles if h rook moves')
    let move2 = newMove(handler, 'h2','h3', rookH, null)
    makeMove(handler, move2)
    assertEquals(handler.boardState.castleRights, 0b1110, 'it does not incorrectly restore castles after h rook moves')
    unMakeMove(handler, move2)
    unMakeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1111, 'it restores short castles if h rook moves')
    // a rook moves
    move= newMove(handler, 'a1','a2', rookA, null)
    makeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1101, 'it revokes long castles if a rook moves')
    unMakeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1111, 'it restores short castles if a rook moves')
    // king moves
    move= newMove(handler, 'e1','e2', king, null)
    makeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1100, 'it revokes castles if king moves')
    unMakeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1111, 'it restores castles if king moves')
})

Deno.test('it revokes castling rights correctly for black', () => {
    const handler = getHandler('r3k2r/8/8/8/8/8/8/R3K2R b KQkq -')
    const king: Piece = getPiece(handler,'e8')
    const rookA = getPiece(handler,'a8')
    const rookH = getPiece(handler,'h8')

    // h rook moves
    let move= newMove(handler, 'h8','h7', rookH, null)
    makeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1011, 'it revokes short castles if h rook moves')
    unMakeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1111, 'it restores short castles if h rook moves')
    // a rook moves
    move= newMove(handler, 'h8','h7', rookA, null)
    makeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b0111, 'it revokes long castles if a rook moves')
    unMakeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1111, 'it restores short castles if a rook moves')
    // king moves
    move= newMove(handler, 'e8','e7', king, null)
    makeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b0011, 'it revokes castles if king moves')
    unMakeMove(handler, move)
    assertEquals(handler.boardState.castleRights, 0b1111, 'it restores castles if king moves')
})

Deno.test('It promotes pawn', () => {
    const handler = new MoveHandler('2k5/6P1/8/8/8/8/1p6/2N1K3')
    const whitePawn = getPiece(handler,'g7')
    const blackPawn = getPiece(handler,'b2')
    const whiteKnight = getPiece(handler,'c1')

    // promotes to queen
    let move = newMove(handler, 'g7', 'g8', whitePawn, null, 'simple', 'q')
    makeMove(handler, move)
    assertSerializesTo(handler,'2k3Q1/8/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'q')
    assertPieceOnSquare(handler,'g8', whitePawn)
    unMakeMove(handler, move)
    assertSerializesTo(handler, '2k5/6P1/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'p')
    assertPieceOnSquare(handler,'g7', whitePawn)

    // promotes to bishop
    move = newMove(handler, 'g7', 'g8', whitePawn, null, 'simple', 'b')
    makeMove(handler, move)
    assertSerializesTo(handler,'2k3B1/8/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'b')
    assertPieceOnSquare(handler, 'g8', whitePawn)
    unMakeMove(handler, move)
    assertSerializesTo(handler, '2k5/6P1/8/8/8/8/1p6/2N1K3')
    assertEquals(whitePawn.type, 'p')
    assertPieceOnSquare(handler,'g7', whitePawn)

    // promotes to bishop
    move = newMove(handler, 'b2', 'c1', blackPawn, whiteKnight, 'simple', 'n')
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
    move = newMove(handler, 'b2', 'c1', blackPawn, whiteKnight, 'simple', 'r')
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
    const handler = new MoveHandler(fen)
    handler.render()
    return handler
}

const makeMove = (handler: MoveHandler, move: Move): void => {
    handler.makeMove(move)
    handler.render()
}

const unMakeMove = (handler: MoveHandler, move: Move): void => {
    handler.unMakeMove(move)
    handler.render()
}

const getPiece = (handler: MoveHandler, square: SquareName): Piece => {
    const piece = handler.getPiece(square)
    if(!piece) throw new Error(`No piece on square: ${square}`)
    return piece
}

const assertSerializesTo = (handler: MoveHandler, fenString: string) => {
    assertEquals(handler.serialize(), fenString, 'Fen position string matches')
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
    assert(handler.pieceMap.pieces[piece.color][piece.type][piece.startSquare] === piece, `Piece(${piece.serialize()}) is in the piece map`)
}

const assertNotInPieceMap = (handler: MoveHandler, piece: Piece): void => {
    assert(handler.pieceMap.pieces[piece.color][piece.type][piece.startSquare] === undefined, `Piece(${piece.serialize()}) is not in the piece map`)
}

const assertInCaptureMap  = (handler: MoveHandler, piece: Piece): void => {
    assert(handler.pieceMap.captures[piece.color][piece.startSquare] === piece, `Piece(${piece.serialize()}) is in the capture map`)
}

const assertNotInCaptureMap = (handler: MoveHandler, piece: Piece): void => {
    assert(handler.pieceMap.captures[piece.color][piece.startSquare] === undefined, `Piece(${piece.serialize()}) is not in the capture map`)
}