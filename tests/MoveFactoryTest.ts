import {MoveFactory} from "../src/MoveFactory.ts";
import {FenNumber} from "../src/FenNumber.ts";
import {Move} from "../src/Move.ts";
import {SquareName} from "../src/Square.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {assertArrayIncludes} from "https://deno.land/std@0.219.0/assert/assert_array_includes.ts";
import {assertExists} from "https://deno.land/std@0.219.0/assert/assert_exists.ts";

const getFactory = (fen: string|FenNumber) => {
    return new MoveFactory(new FenNumber(fen))
}

const assertTargetSquaresEqual = (moves: Move[], expected: SquareName[]) => {
    const flattenedMoves = moveToTargetSquareNames(moves)
    assertArrayIncludes(flattenedMoves, expected, `Move list includes expected squares`)
    assertEquals(flattenedMoves.length, expected.length, 'Move list contains only expected squares')
}

const moveToTargetSquareNames = (moves: Move[]): SquareName[] => {
    return moves.map((move: Move) => move.newSquare).filter((v,i,a)=>a.indexOf(v)==i)
}

const assertGeneratesMoves = (fen: string, square: SquareName, expected: SquareName[]): Move[] => {
    const fenNumber = new FenNumber(fen)
    const factory = getFactory(fenNumber)
    const moves = factory.getLegalMoves(square)
    factory.render(moveToTargetSquareNames(moves))
    assertTargetSquaresEqual(moves,expected)
    return moves
}

const assertHasCaptureOn = (moves: Move[], square: SquareName, pieceFen: string) => {
    const captureMove = moves.filter((move: Move) => move.newSquare === square)
    assertEquals(captureMove.length,1, `Capture move found on square: {$square}`)
    assertExists(captureMove[0].captured)
    assertEquals(captureMove[0].captured?.serialize(), pieceFen)
}


Deno.test('it gets moves on open board', () => {

    // Knight moves
    assertGeneratesMoves('3k4/8/8/4N3/8/8/8/3K4', 'e5', ['f7','g6','g4','f3','d3','c4','c6','d7'])
    // King moves
    assertGeneratesMoves('3k4/8/8/4K3/8/8/8/8', 'e5', ['e6','f6','f5','f4','e4','d4','d5','d6'])
    // Bishop moves
    assertGeneratesMoves('3k4/8/8/4B3/8/8/8/3K4', 'e5', [
        'f6','g7','h8', // NE
        'f4','g3','h2', // SE
        'd4','c3','b2','a1', // SW
        'd6','c7','b8' // NW
    ])
    // Rook Moves
    assertGeneratesMoves('3k4/8/8/4R3/8/8/8/3K4', 'e5', [
        'e6','e7','e8', // N
        'f5','g5','h5', // E
        'e4','e3','e2','e1', // S
        'd5','c5','b5','a5', // W
    ])
    // castles as white
    assertGeneratesMoves('r3k2r/8/8/8/8/8/8/R3K2R w KQ', 'e1', ['c1','d1','d2','e2','f2','f1','g1'])
    // castles as black
    assertGeneratesMoves('r3k2r/8/8/8/8/8/8/R3K2R b kq', 'e8', ['c8','d8','d7','e7','f7','f8','g8'])

    // Queen Moves
    assertGeneratesMoves('3k4/8/8/4Q3/8/8/8/3K4', 'e5', [
        'e6','e7','e8', // N
        'f5','g5','h5', // E
        'e4','e3','e2','e1', // S
        'd5','c5','b5','a5', // W
        'f6','g7','h8', // NE
        'f4','g3','h2', // SE
        'd4','c3','b2','a1', // SW
        'd6','c7','b8' // NW
    ])
    // Pawn moves
    assertGeneratesMoves('3k4/8/8/4P3/8/8/8/3K4', 'e5', ['e6'])
})

Deno.test('it handles blocked moves and captures', () => {

    // Knight moves
    let moves = assertGeneratesMoves('3k4/8/8/p1p5/3p4/1n6/3P4/2pK4', 'b3', ['a1','d2'])
    assertHasCaptureOn(moves,'d2','P')
    // King moves
    moves = assertGeneratesMoves('3k4/8/8/8/8/8/1pP5/1PKp4', 'c1', ['b2','d2','d1'])
    assertHasCaptureOn(moves,'b2','p')
    assertHasCaptureOn(moves,'d1','p')
    // Bishop moves
    moves = assertGeneratesMoves('3k4/8/4P3/8/P7/1b6/p7/2Kp4', 'b3', ['a4','c4','d5','c2','e6'])
    assertHasCaptureOn(moves,'a4','P')
    assertHasCaptureOn(moves,'e6','P')
    // Rook moves
    moves = assertGeneratesMoves('3k4/8/8/1P6/8/PRp5/8/1pK5', 'b3', ['b4','c3','b2','b1'])
    assertHasCaptureOn(moves,'b1','p')
    assertHasCaptureOn(moves,'c3','p')
    // Queen moves
    moves = assertGeneratesMoves('3k4/8/8/1P6/P1P5/PQP5/P1P5/1pK5', 'b3', ['b4','b2','b1'])
    assertHasCaptureOn(moves,'b1','p')
    // Pawn moves
    moves = assertGeneratesMoves('3k1ppp/6P1/8/8/8/8/8/2K5', 'g7', ['f8','h8'])
    assertHasCaptureOn(moves,'f8','p')
    assertHasCaptureOn(moves,'h8','p')
    assertEquals(moves.every((move) =>  move.type === 'pawn-promotion'), true)
    // en-passant as white
    moves = assertGeneratesMoves('3k4/8/p7/Pp6/6Pp/7P/8/2K5 w - b6 0 1', 'a5', ['b6'])
    assertEquals(moves.every((move) =>  move.type === 'en-passant'), true)
    // en-passant as black
    moves = assertGeneratesMoves('3k4/8/p7/Pp6/6Pp/7P/8/2K5 w - g3 0 1', 'h4', ['g3'])
    assertEquals(moves.every((move) =>  move.type === 'en-passant'), true)
})

Deno.test('it handles illegal castles', () => {

    // cannot castle when rooks are MIA
    assertGeneratesMoves('4k3/r2ppp1r/8/8/8/8/R2PPP1R/4K3 b KQkq', 'e8', ['d8','f8'])
    assertGeneratesMoves('4k3/r2ppp1r/8/8/8/8/R2PPP1R/4K3 w KQkq', 'e1', ['d1','f1'])
    // cannot castle when adjacent squares are occupied
    assertGeneratesMoves('r2qkb1r/3ppp2/8/8/8/8/3PPP2/R2QKB1R b KQkq', 'e8', [])
    assertGeneratesMoves('r2qkb1r/3ppp2/8/8/8/8/3PPP2/R2QKB1R w KQkq', 'e1', [])
    // cannot castle when target square is occupied
    assertGeneratesMoves('r1b1k1nr/3ppp2/8/8/8/8/3PPP2/R1B1K1NR b KQkq', 'e8', ['d8','f8'])
    assertGeneratesMoves('r1b1k1nr/3ppp2/8/8/8/8/3PPP2/R1B1K1NR w KQkq', 'e1', ['d1','f1'])
    // cannot castle queen-side when b file is occupied
    assertGeneratesMoves('rn2k1nr/3ppp2/8/8/8/8/3PPP2/RN2K1NR b KQkq', 'e8', ['d8','f8'])
    assertGeneratesMoves('rn2k1nr/3ppp2/8/8/8/8/3PPP2/RN2K1NR w KQkq', 'e1', ['d1','f1'])
    // cannot castle when king is in check
    assertGeneratesMoves('r3k2r/3ppp2/3N4/8/8/5n2/3PPP2/R3K2R b KQkq', 'e8', ['d8','f8'])
    assertGeneratesMoves('r3k2r/3ppp2/3N4/8/8/5n2/3PPP2/R3K2R w KQkq', 'e1', ['d1','f1'])
    // cannot castle when squares the king must move through are threatened
    assertGeneratesMoves('r3k2r/3ppp2/4N3/8/8/8/3PPP2/R3K2R b KQkq', 'e8', [])
    assertGeneratesMoves('r3k2r/3ppp2/8/8/8/4n3/3PPP2/R3K2R w KQkq', 'e1', [])
    // cannot castle into a check
    assertGeneratesMoves('r3k2r/3ppp1B/Q7/8/8/q7/3PPP1b/R3K2R b KQkq', 'e8', ['d8','f8'])
    assertGeneratesMoves('r3k2r/3ppp1B/Q7/8/8/q7/3PPP1b/R3K2R w KQkq', 'e1', ['d1','f1'])
})

Deno.test('it forbids moving into and allows moving out of check', () => {
    // pinned knight cannot move
    assertGeneratesMoves('r2q1b1r/ppp1kppp/4bn2/1B1P2B1/8/4Q3/PPP2PPP/RN2K2R', 'f6', [])
    // pinned bishop cannot move
    assertGeneratesMoves('r2q1b1r/ppp1kppp/4bn2/1B1P2B1/8/4Q3/PPP2PPP/RN2K2R', 'e6', [])
    // king can only move to safe squares
    assertGeneratesMoves('r2q1b1r/ppp1kppp/4bn2/1B1P2B1/8/4Q3/PPP2PPP/RN2K2R', 'e7', ['d6'])
    // king can move out of check with capture or regular move
    assertGeneratesMoves('r2q1b1r/1pp1kppp/p3bB2/1B1P4/8/4Q3/PPP2PPP/RN2K2R b KQ - 0 10', 'e7', ['d6','f6'])
})



Deno.test('it generates all moves in a position', () => {

    // all moves for white
    let fen = new FenNumber('2b1rr2/6kp/1R6/1p6/4n3/2N4P/PPP1B1P1/2K4R w - - 0 24')
    let factory = getFactory(fen)
    let moves = factory.getAllLegalMoves()
    factory.render(moveToTargetSquareNames(moves))
    assertTargetSquaresEqual(moves,[
        'b8','b7','a6','c6','d6','e6','f6','g6','h6',
        'b5','d5','h5','a4','b4','c4','e4','g4','h4',
        'a3','b3','d3','f3','g3','h2',
        'b1','d1','e1','f1','g1',
    ])

    // all moves for black
    fen = new FenNumber('2b1rr2/6kp/1R6/1p6/4n3/2N4P/PPP1B1P1/2K4R b - - 0 24')
    factory = getFactory(fen)
    moves = factory.getAllLegalMoves()
    factory.render(moveToTargetSquareNames(moves))
    assertTargetSquaresEqual(moves,[
        'd8','b7','b4','c5','c3','d2','d6','d7','d8',
        'e7','e6','e5','f7','f6','f5','f4','f3','f2','f1',
        'g8','h8','g5','g4','g3','h6','h5','h3'
    ])
})

Deno.test('it generates perft 1', () => {

    const fenNumber = new FenNumber('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    const factory = getFactory(fenNumber)

    console.log(factory.perft(4))

})