import {PerftCounter, PerftRunner} from "../../src/MoveGen/PerftRunner.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";


// https://www.chessprogramming.org/Perft_Results
const expectedResults = {
    1: new PerftCounter(48,8,0,2,0,0,0,0,0),
    2: new PerftCounter(2039,351,1,91,0,3,0,0,0),
    3: new PerftCounter(97862,17102,45,3162,0,993,0,0,1),
    4: new PerftCounter(4085603, 757163,1929,128013,15172,25523,42,6,43),
    5: new PerftCounter(193690690,35043416,73365,4993637,8392,3309887,19883,2637,30171),
    6: new PerftCounter(8031647685,1558445089,3577504,184513607,56627920,92238050,568417,54948,360003),
}

const getPerftResult = (depth: number) => {
    const runner = new PerftRunner('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -')
    const result = runner.run(depth)
    console.table(result)
    return result
}

const assertResultMatches = (actual: PerftCounter, depth: number) =>
{
    // @ts-ignore - it's fine
    const expected = expectedResults[depth] ?? null
    assertEquals(actual.nodes, expected.nodes, `Incorrect node count`)
    assertEquals(actual.captures, expected.captures, `Incorrect capture count`)
    assertEquals(actual.passants, expected.passants, `Incorrect en-passant count`)
    assertEquals(actual.castles, expected.castles, `Incorrect castles count`)
    assertEquals(actual.promotions, expected.promotions, `Incorrect promotions count`)
    assertEquals(actual.checks, expected.checks, `Incorrect checks count`)
    //TODO: Add discovered/double check detection
    //assertEquals(actual.discoveredChecks, expected.discoveredChecks, `Incorrect discovered checks count`)
    //assertEquals(actual.doubleChecks, expected.doubleChecks, `Incorrect double checks count`)
    assertEquals(actual.checkMates, expected.checkMates, `Incorrect check mates count`)
}

Deno.test('It passes Kiwipete 1', () => {
    assertResultMatches(getPerftResult(1),1)
})

Deno.test('It passes Kiwipete 2', () => {
    assertResultMatches(getPerftResult(2),2)
})

Deno.test('It passes Kiwipete 3', () => {
    assertResultMatches(getPerftResult(3),3)
})

Deno.test('It passes Kiwipete 4', () => {
    assertResultMatches(getPerftResult(4),4)
})

//TODO: Currently too slow to run
// Deno.test('It passes Kiwipete 5', () => {
//     assertResultMatches(getPerftResult(5),5)
// })

// Deno.test('It passes perft 6', () => {
//     assertResultMatches(getPerftResult(6),6)
// })